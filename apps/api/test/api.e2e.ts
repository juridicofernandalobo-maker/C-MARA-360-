/**
 * Testes de ponta a ponta contra PostgreSQL real.
 * Usa DATABASE_URL_TESTE (padrão: banco camara360_test local), que é apagado e recriado a cada execução.
 */
process.env.DATABASE_URL = process.env.DATABASE_URL_TESTE ?? 'postgresql://camara:camara@localhost:5432/camara360_test?schema=public'
process.env.JWT_SECRET = 'segredo-de-teste-com-mais-de-32-caracteres'
process.env.LOGIN_LIMITE_POR_MINUTO = '1000'

import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { execSync } from 'node:child_process'
import { authenticator } from 'otplib'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { configurar } from '../src/configurar'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthService } from '../src/auth/auth.service'

let app: INestApplication
let prisma: PrismaService
const SENHA = 'Senha-de-teste-1'
const tok: Record<string, string> = {}
const ids: Record<string, string> = {}

const http = () => request(app.getHttpServer())
const comToken = (quem: string) => ({ Authorization: `Bearer ${tok[quem]}` })

async function login(camara: string | undefined, email: string, codigo?: string) {
  const r = await http().post('/api/auth/login').send({ camara, email, senha: SENHA, codigo })
  return r
}

async function acao(quem: string, id: string, corpo: object, esperado = 201) {
  const r = await http().post(`/api/proposicoes/${id}/acoes`).set(comToken(quem)).send(corpo)
  if (r.status !== esperado) throw new Error(`${JSON.stringify(corpo)} → ${r.status} ${JSON.stringify(r.body)}`)
  return r.body
}

beforeAll(async () => {
  execSync('npx prisma migrate reset --force --skip-seed --skip-generate', { env: process.env, stdio: 'ignore' })
  const mod = await Test.createTestingModule({ imports: [AppModule] }).compile()
  app = mod.createNestApplication()
  configurar(app)
  await app.init()
  prisma = app.get(PrismaService)
  await prisma.usuario.create({
    data: { email: 'root@plataforma.dev', nome: 'Root', senhaHash: await AuthService.hash(SENHA), papeis: ['plataforma'], mfaAtivo: false },
  })
})

afterAll(async () => {
  await app?.close()
})

describe('plataforma e cadastro institucional', () => {
  it('administrador da plataforma é obrigado a configurar MFA antes de operar', async () => {
    const r = await login(undefined, 'root@plataforma.dev')
    expect(r.status).toBe(200)
    expect(r.body.escopo).toBe('configurar_mfa')
    tok.rootRestrito = r.body.token
    const bloqueado = await http().get('/api/camaras').set(comToken('rootRestrito'))
    expect(bloqueado.status).toBe(403)

    const ini = await http().post('/api/auth/mfa/iniciar').set(comToken('rootRestrito'))
    expect(ini.status).toBe(201)
    const conf = await http().post('/api/auth/mfa/confirmar').set(comToken('rootRestrito')).send({ codigo: authenticator.generate(ini.body.segredo) })
    expect(conf.status).toBe(200)

    expect((await login(undefined, 'root@plataforma.dev')).status).toBe(401) // agora exige código
    const ok = await login(undefined, 'root@plataforma.dev', authenticator.generate(ini.body.segredo))
    expect(ok.body.escopo).toBe('completo')
    tok.root = ok.body.token
  })

  it('cria duas Câmaras com o modelo padrão de ritos', async () => {
    for (const [slug, ibge, cnpj] of [['vale-verde', '2300001', '11111111000191'], ['serra-azul', '2300002', '22222222000191']]) {
      const r = await http().post('/api/camaras').set(comToken('root')).send({
        slug, nome: `Câmara Municipal de ${slug}`, municipio: slug, uf: 'CE', codigoIbge: ibge, cnpj, totalMembros: 11, exigirMfa: false,
        administrador: { nome: 'Admin', email: `admin@${slug}.dev`, senha: SENHA },
      })
      expect(r.status).toBe(201)
    }
    const dup = await http().post('/api/camaras').set(comToken('root')).send({
      slug: 'vale-verde', nome: 'Duplicada', municipio: 'Duplicada', uf: 'CE', codigoIbge: '2300009', cnpj: '33333333000191', totalMembros: 9,
      administrador: { nome: 'Admin', email: 'a@b.dev', senha: SENHA },
    })
    expect(dup.status).toBe(409)
  })

  it('recusa Câmara com número de vereadores fora do art. 29, IV, da CF', async () => {
    const r = await http().post('/api/camaras').set(comToken('root')).send({
      slug: 'invalida', nome: 'Inválida', municipio: 'Inválida', uf: 'CE', codigoIbge: '2300003', cnpj: '44444444000191', totalMembros: 7,
      administrador: { nome: 'Admin', email: 'a@b.dev', senha: SENHA },
    })
    expect(r.status).toBe(400)
  })

  it('administrador da Câmara cadastra parlamentares e usuários', async () => {
    tok.admin = (await login('vale-verde', 'admin@vale-verde.dev')).body.token
    tok.adminSerra = (await login('serra-azul', 'admin@serra-azul.dev')).body.token

    for (const n of ['Ana Ribeiro', 'Bruno Castro']) {
      const r = await http().post('/api/parlamentares').set(comToken('admin')).send({ nomeParlamentar: n, nomeCivil: n })
      expect(r.status).toBe(201)
      ids[n] = r.body.id
    }
    const usuarios = [
      { email: 'ana@vv.dev', papeis: ['vereador'], parlamentarId: ids['Ana Ribeiro'] },
      { email: 'assessor@vv.dev', papeis: ['assessor'], parlamentarId: ids['Ana Ribeiro'] },
      { email: 'bruno@vv.dev', papeis: ['vereador'], parlamentarId: ids['Bruno Castro'] },
      { email: 'secretaria@vv.dev', papeis: ['servidor'] },
      { email: 'presidente@vv.dev', papeis: ['presidente', 'mesa'] },
    ]
    for (const u of usuarios) {
      const r = await http().post('/api/usuarios').set(comToken('admin')).send({ nome: u.email, senha: SENHA, ...u })
      expect(r.status).toBe(201)
      expect(r.body.senhaHash).toBeUndefined()
    }
    const semGabinete = await http().post('/api/usuarios').set(comToken('admin')).send({ nome: 'X', email: 'x@vv.dev', senha: SENHA, papeis: ['vereador'] })
    expect(semGabinete.status).toBe(400)
    const papelInvalido = await http().post('/api/usuarios').set(comToken('admin')).send({ nome: 'X', email: 'y@vv.dev', senha: SENHA, papeis: ['plataforma'] })
    expect(papelInvalido.status).toBe(400)

    for (const q of ['ana', 'assessor', 'bruno', 'secretaria', 'presidente']) tok[q] = (await login('vale-verde', `${q}@vv.dev`)).body.token
  })

  it('senha errada e Câmara errada retornam a mesma mensagem genérica', async () => {
    const a = await http().post('/api/auth/login').send({ camara: 'vale-verde', email: 'ana@vv.dev', senha: 'errada-123456' })
    const b = await http().post('/api/auth/login').send({ camara: 'serra-azul', email: 'ana@vv.dev', senha: SENHA })
    expect(a.status).toBe(401)
    expect(b.status).toBe(401)
    expect(a.body.message).toBe(b.body.message)
  })

  it('vereador não acessa a gestão de usuários', async () => {
    expect((await http().get('/api/usuarios').set(comToken('ana'))).status).toBe(403)
  })
})

describe('tramitação de Projeto de Lei Ordinária pela API', () => {
  it('assessor redige; vereadora protocola; Secretaria conduz até a publicação', async () => {
    const criada = await http().post('/api/proposicoes').set(comToken('assessor')).send({
      especie: 'PLO', ementa: 'Institui o Programa Municipal de Iluminação Pública Eficiente.', texto: 'Art. 1º Fica instituído...',
      autorTipo: 'prefeito', // ignorado: gabinete só apresenta em nome do próprio parlamentar
    })
    expect(criada.status).toBe(201)
    expect(criada.body.autor).toBe('Ana Ribeiro')
    expect(criada.body.estado).toBe('rascunho')
    ids.plo = criada.body.id

    const outroGabinete = await http().post(`/api/proposicoes/${ids.plo}/acoes`).set(comToken('bruno')).send({ tipo: 'protocolar' })
    expect(outroGabinete.status).toBe(403)

    const prot = await acao('ana', ids.plo, { tipo: 'protocolar', data: '2026-11-12' })
    expect(prot.identificacao).toBe('PLO 1/2026')
    expect(prot.hashTexto).toMatch(/^[a-f0-9]{64}$/)

    const editar = await http().patch(`/api/proposicoes/${ids.plo}`).set(comToken('ana')).send({ texto: 'outro' })
    expect(editar.status).toBe(409)

    const vereadorVotando = await http().post(`/api/proposicoes/${ids.plo}/acoes`).set(comToken('ana')).send({ tipo: 'ler' })
    expect(vereadorVotando.status).toBe(403)

    await acao('secretaria', ids.plo, { tipo: 'ler', data: '2026-11-13' })
    const dist = await acao('secretaria', ids.plo, { tipo: 'distribuir', data: '2026-11-13' })
    expect(dist.tramitacao.prazoParecer).toBe('2026-12-04')
    await acao('secretaria', ids.plo, { tipo: 'registrar_parecer', data: '2026-11-19', comissao: 'CCJ', sentido: 'favoravel' })
    await acao('secretaria', ids.plo, { tipo: 'incluir_pauta', data: '2026-11-24' })

    const semQuorum = await acao('secretaria', ids.plo, { tipo: 'votar', data: '2026-11-24', votos: { presentes: 5, sim: 5, nao: 0, abstencao: 0 } }, 422)
    expect(semQuorum.erros[0]).toMatch(/Sem quórum/)

    await acao('secretaria', ids.plo, { tipo: 'votar', data: '2026-11-24', votos: { presentes: 9, sim: 6, nao: 3, abstencao: 0 } })
    await acao('secretaria', ids.plo, { tipo: 'aprovar_redacao_final', data: '2026-11-24' })
    const env = await acao('secretaria', ids.plo, { tipo: 'enviar_sancao', data: '2026-11-25' })
    expect(env.acoesPossiveis).toEqual(expect.arrayContaining(['sancionar', 'vetar']))
    await acao('secretaria', ids.plo, { tipo: 'sancionar', data: '2026-12-01' })
    const pub = await acao('secretaria', ids.plo, { tipo: 'publicar', data: '2026-12-02' })
    expect(pub.estado).toBe('publicada')
    expect(pub.movimentacoes).toHaveLength(10)
    expect(pub.acoesPossiveis).toEqual([])
  })

  it('numeração segue sequencial por espécie', async () => {
    const c = await http().post('/api/proposicoes').set(comToken('bruno')).send({ especie: 'PLO', ementa: 'Dispõe sobre transparência das rotas escolares.', texto: 'Art. 1º ...' })
    const p = await acao('bruno', c.body.id, { tipo: 'protocolar', data: '2026-11-14' })
    expect(p.identificacao).toBe('PLO 2/2026')
  })

  it('bloqueia vício de iniciativa no protocolo, com aviso já no rascunho', async () => {
    const c = await http().post('/api/proposicoes').set(comToken('ana')).send({
      especie: 'PLO', ementa: 'Cria cargos na Secretaria Municipal de Saúde.', texto: 'Art. 1º Ficam criados...', materias: ['cargos_executivo'],
    })
    expect(c.status).toBe(201)
    expect(c.body.avisos[0]).toMatch(/privativa de "prefeito"/)
    const r = await acao('ana', c.body.id, { tipo: 'protocolar' }, 422)
    expect(r.erros[0]).toMatch(/Vício de iniciativa/)
  })

  it('Secretaria protocola projeto do Executivo', async () => {
    const c = await http().post('/api/proposicoes').set(comToken('secretaria')).send({
      especie: 'PLO', ementa: 'Cria cargos na Secretaria Municipal de Saúde.', texto: 'Art. 1º ...', materias: ['cargos_executivo'],
      autorTipo: 'prefeito', autorDescricao: 'Poder Executivo — Prefeito Municipal',
    })
    const p = await acao('secretaria', c.body.id, { tipo: 'protocolar', data: '2026-11-15' })
    expect(p.identificacao).toBe('PLO 3/2026')
    expect(p.autor).toBe('Poder Executivo — Prefeito Municipal')
  })

  it('indicação é lida e encaminhada, sem votação', async () => {
    const c = await http().post('/api/proposicoes').set(comToken('ana')).send({ especie: 'IND', ementa: 'Indica a recuperação da iluminação da Rua das Flores.', texto: 'Indico...' })
    await acao('ana', c.body.id, { tipo: 'protocolar', data: '2026-11-12' })
    const lida = await acao('secretaria', c.body.id, { tipo: 'ler', data: '2026-11-12' })
    expect(lida.acoesPossiveis).toEqual(['encaminhar_executivo', 'retirar', 'arquivar'])
    expect((await acao('secretaria', c.body.id, { tipo: 'encaminhar_executivo', data: '2026-11-13' })).estado).toBe('encaminhada_executivo')
  })

  it('ação desconhecida e parâmetros inválidos são recusados', async () => {
    expect((await http().post(`/api/proposicoes/${ids.plo}/acoes`).set(comToken('secretaria')).send({ tipo: 'apagar' })).status).toBe(400)
    expect((await http().get('/api/proposicoes/nao-e-uuid').set(comToken('ana'))).status).toBe(400)
  })
})

describe('isolamento entre Câmaras', () => {
  it('usuário de outra Câmara não enxerga nem altera proposições', async () => {
    expect((await http().get(`/api/proposicoes/${ids.plo}`).set(comToken('adminSerra'))).status).toBe(404)
    expect((await http().get('/api/proposicoes').set(comToken('adminSerra'))).body).toEqual([])
    expect((await http().patch(`/api/parlamentares/${ids['Ana Ribeiro']}`).set(comToken('adminSerra')).send({ ativo: false })).status).toBe(404)
  })
  it('não é possível vincular usuário a parlamentar de outra Câmara', async () => {
    const r = await http().post('/api/usuarios').set(comToken('adminSerra')).send({
      nome: 'Intruso', email: 'intruso@sa.dev', senha: SENHA, papeis: ['vereador'], parlamentarId: ids['Ana Ribeiro'],
    })
    expect(r.status).toBe(400)
  })
})

describe('configuração regimental', () => {
  it('presidente ajusta espécie; configurações incoerentes são recusadas', async () => {
    const camara = (await http().get('/api/camaras/atual').set(comToken('presidente'))).body
    const plo = camara.especies.find((e: { sigla: string }) => e.sigla === 'PLO').config
    const ok = await http().put('/api/camaras/atual/especies/PLO').set(comToken('presidente')).send({ ...plo, comissoes: ['CCJ', 'CFO'] })
    expect(ok.status).toBe(200)
    const ruim = await http().put('/api/camaras/atual/especies/PLO').set(comToken('presidente')).send({ ...plo, comissoes: ['XYZ'] })
    expect(ruim.status).toBe(422)
    expect(ruim.body.erros[0]).toMatch(/XYZ/)
    expect((await http().put('/api/camaras/atual/especies/PLO').set(comToken('ana')).send(plo)).status).toBe(403)
  })
})

describe('proteção contra força bruta', () => {
  it('bloqueia o IP após exceder o limite de tentativas de login', async () => {
    process.env.LOGIN_LIMITE_POR_MINUTO = '3'
    const status: number[] = []
    for (let i = 0; i < 5; i++) {
      status.push((await http().post('/api/auth/login').send({ camara: 'vale-verde', email: 'ana@vv.dev', senha: 'tentativa-errada' })).status)
    }
    expect(status).toContain(429)
    process.env.LOGIN_LIMITE_POR_MINUTO = '1000'
  })
})

describe('auditoria', () => {
  it('registra operações de escrita, inclusive falhas, sem gravar senhas', async () => {
    const r = await http().get('/api/auditoria?limite=500').set(comToken('presidente'))
    expect(r.status).toBe(200)
    expect(r.body.some((a: { status: number }) => a.status === 422)).toBe(true)
    expect(r.body.some((a: { rota: string }) => a.rota.includes('/acoes'))).toBe(true)
    const todas = await prisma.auditoria.findMany()
    expect(JSON.stringify(todas, (_, v) => (typeof v === 'bigint' ? v.toString() : v))).not.toContain(SENHA)
    expect((await http().get('/api/auditoria').set(comToken('ana'))).status).toBe(403)
  })
})
