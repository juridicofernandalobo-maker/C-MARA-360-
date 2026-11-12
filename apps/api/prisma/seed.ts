/**
 * Dados de DEMONSTRAÇÃO (município fictício "Vale Verde/CE").
 * Não execute em produção: as senhas abaixo são públicas.
 */
import { especiesPadrao, regrasPadrao } from '@camara360/rito'
import { Prisma, PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const SENHA = 'Camara360@demo'
const json = (v: unknown) => v as Prisma.InputJsonValue

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Seed de demonstração bloqueado em produção.')
  const hash = await bcrypt.hash(SENHA, 12)

  const plataforma = { email: 'plataforma@camara360.dev', nome: 'Administração da Plataforma', senhaHash: hash, papeis: ['plataforma'] }
  if (!(await prisma.usuario.findFirst({ where: { email: plataforma.email, camaraId: null } }))) {
    await prisma.usuario.create({ data: plataforma })
  }

  if (await prisma.camara.findUnique({ where: { slug: 'vale-verde' } })) {
    console.log('Câmara de demonstração já existe; nada a fazer.')
    return
  }

  const camara = await prisma.camara.create({
    data: {
      slug: 'vale-verde', nome: 'Câmara Municipal de Vale Verde', municipio: 'Vale Verde', uf: 'CE',
      codigoIbge: '2399999', cnpj: '00000000000191', exigirMfa: false,
      regras: json({ ...regrasPadrao(11), feriados: ['2026-11-02', '2026-11-20', '2026-12-25'] }),
    },
  })
  await prisma.especieNormativa.createMany({ data: especiesPadrao.map(e => ({ camaraId: camara.id, sigla: e.sigla, config: json(e) })) })
  await prisma.comissao.createMany({
    data: [
      { camaraId: camara.id, sigla: 'CCJ', nome: 'Comissão de Constituição, Justiça e Redação' },
      { camaraId: camara.id, sigla: 'CFO', nome: 'Comissão de Finanças e Orçamento' },
      { camaraId: camara.id, sigla: 'CEC', nome: 'Comissão de Educação e Cultura' },
    ],
  })

  const nomes = ['Ana Ribeiro', 'Bruno Castro', 'Carla Menezes', 'Davi Nogueira', 'Elisa Prado', 'Fábio Lima',
    'Gabriela Sousa', 'Heitor Alves', 'Íris Monteiro', 'João Pedro Sales', 'Karina Feitosa']
  const parl: Record<string, string> = {}
  for (const n of nomes) {
    const p = await prisma.parlamentar.create({ data: { camaraId: camara.id, nomeParlamentar: n, nomeCivil: `${n} (nome civil)` } })
    parl[n] = p.id
  }

  const usuarios = [
    { email: 'admin@valeverde.dev', nome: 'Administração da Câmara', papeis: ['administrador'] },
    { email: 'presidente@valeverde.dev', nome: 'Bruno Castro', papeis: ['presidente', 'mesa', 'vereador'], parlamentarId: parl['Bruno Castro'] },
    { email: 'ana@valeverde.dev', nome: 'Ana Ribeiro', papeis: ['vereador'], parlamentarId: parl['Ana Ribeiro'] },
    { email: 'assessor.ana@valeverde.dev', nome: 'Lucas Pereira', papeis: ['assessor'], parlamentarId: parl['Ana Ribeiro'] },
    { email: 'secretaria@valeverde.dev', nome: 'Marta Oliveira', papeis: ['servidor'] },
    { email: 'procuradoria@valeverde.dev', nome: 'Renato Gomes', papeis: ['procurador'] },
  ]
  for (const u of usuarios) await prisma.usuario.create({ data: { ...u, camaraId: camara.id, senhaHash: hash } })

  console.log('Demonstração criada. Câmara: "vale-verde". Senha de todos os usuários:', SENHA)
  console.table(usuarios.map(u => ({ email: u.email, papeis: u.papeis.join(', ') })))
}

main().finally(() => prisma.$disconnect())
