import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException,
} from '@nestjs/common'
import {
  acoesPossiveis, alertasDePrazo, aplicar, novaTramitacao, proximoNumero, verificarIniciativa,
  type Acao, type EspecieConfig, type RegrasCasa, type TipoAcao, type Tramitacao,
} from '@camara360/rito'
import { Prisma } from '@prisma/client'
import { createHash } from 'node:crypto'
import type { Papel, UsuarioToken } from '../comum/papeis'
import { PrismaService } from '../prisma/prisma.service'
import { ACOES_DO_AUTOR, PERMISSAO_ACAO } from './permissoes'
import { CriarProposicaoDto, EditarProposicaoDto } from './proposicoes.dto'

/** Data de hoje no fuso de Fortaleza (AAAA-MM-DD). */
export function hoje(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(new Date())
}

const json = (v: unknown) => v as Prisma.InputJsonValue
const ehGabinete = (u: UsuarioToken) => u.papeis.includes('vereador') || u.papeis.includes('assessor')

@Injectable()
export class ProposicoesService {
  constructor(private prisma: PrismaService) {}

  private async contexto(camaraId: string, sigla: string) {
    const [camara, especie] = await Promise.all([
      this.prisma.camara.findUniqueOrThrow({ where: { id: camaraId } }),
      this.prisma.especieNormativa.findUnique({ where: { camaraId_sigla: { camaraId, sigla } } }),
    ])
    if (!especie || !especie.ativa) throw new BadRequestException(`Espécie "${sigla}" não disponível nesta Câmara.`)
    return { regras: camara.regras as unknown as RegrasCasa, especie, config: especie.config as unknown as EspecieConfig }
  }

  async criar(camaraId: string, u: UsuarioToken, dto: CriarProposicaoDto) {
    const { regras, especie, config } = await this.contexto(camaraId, dto.especie)

    let autorTipo = dto.autorTipo ?? 'vereador'
    let autorParlamentarId = dto.autorParlamentarId ?? null
    if (ehGabinete(u)) {
      autorTipo = 'vereador'
      autorParlamentarId = u.parlamentarId
    } else if (!u.papeis.some(p => (['servidor', 'presidente', 'mesa'] as Papel[]).includes(p))) {
      throw new ForbiddenException('Seu perfil não pode cadastrar proposições.')
    }
    if (autorTipo === 'vereador') {
      if (!autorParlamentarId) throw new BadRequestException('Informe o parlamentar autor.')
      const p = await this.prisma.parlamentar.findFirst({ where: { id: autorParlamentarId, camaraId, ativo: true } })
      if (!p) throw new BadRequestException('Parlamentar autor não encontrado nesta Câmara.')
    } else if (!dto.autorDescricao) {
      throw new BadRequestException('Informe a descrição do autor (ex.: "Poder Executivo — Prefeito Municipal").')
    }

    const tramitacao = novaTramitacao(autorTipo, { regime: dto.regime, materias: dto.materias })
    // Aviso antecipado de vício de iniciativa: não bloqueia o rascunho, mas bloqueará o protocolo.
    const avisos = verificarIniciativa(config, regras, tramitacao)

    const p = await this.prisma.proposicao.create({
      data: {
        camaraId, especieId: especie.id, ano: Number(hoje().slice(0, 4)), ementa: dto.ementa, texto: dto.texto,
        autorTipo, autorParlamentarId: autorTipo === 'vereador' ? autorParlamentarId : null,
        autorDescricao: autorTipo === 'vereador' ? null : dto.autorDescricao, materias: tramitacao.materias,
        regime: tramitacao.regime, estado: tramitacao.estado, tramitacao: json(tramitacao), criadoPorId: u.sub,
      },
    })
    return { ...(await this.detalhar(camaraId, p.id)), avisos }
  }

  async listar(camaraId: string, filtros: { estado?: string; especie?: string }) {
    const lista = await this.prisma.proposicao.findMany({
      where: { camaraId, estado: filtros.estado, especie: filtros.especie ? { sigla: filtros.especie } : undefined },
      include: { especie: { select: { sigla: true } }, autorParlamentar: { select: { nomeParlamentar: true } } },
      orderBy: [{ criadoEm: 'desc' }],
      take: 200,
    })
    const dia = hoje()
    return lista.map(p => ({
      id: p.id,
      identificacao: p.numero ? `${p.especie.sigla} ${p.numero}/${p.ano}` : `${p.especie.sigla} (rascunho)`,
      ementa: p.ementa,
      autor: p.autorParlamentar?.nomeParlamentar ?? p.autorDescricao,
      estado: p.estado,
      alertas: alertasDePrazo(p.tramitacao as unknown as Tramitacao, dia),
    }))
  }

  async detalhar(camaraId: string, id: string) {
    const p = await this.prisma.proposicao.findFirst({
      where: { id, camaraId },
      include: {
        especie: true,
        autorParlamentar: { select: { id: true, nomeParlamentar: true } },
        movimentacoes: { orderBy: { em: 'asc' } },
      },
    })
    if (!p) throw new NotFoundException('Proposição não encontrada.')
    const config = p.especie.config as unknown as EspecieConfig
    const t = p.tramitacao as unknown as Tramitacao
    return {
      id: p.id,
      identificacao: p.numero ? `${p.especie.sigla} ${p.numero}/${p.ano}` : `${p.especie.sigla} (rascunho)`,
      especie: { sigla: p.especie.sigla, nome: config.nome },
      numero: p.numero, ano: p.ano, ementa: p.ementa, texto: p.texto, hashTexto: p.hashTexto,
      autor: p.autorParlamentar?.nomeParlamentar ?? p.autorDescricao, autorTipo: p.autorTipo, autorParlamentarId: p.autorParlamentarId,
      materias: p.materias, regime: p.regime, estado: p.estado, tramitacao: t,
      protocoladaEm: p.protocoladaEm, criadoEm: p.criadoEm,
      acoesPossiveis: acoesPossiveis(config, t),
      alertas: alertasDePrazo(t, hoje()),
      movimentacoes: p.movimentacoes.map(m => ({ acao: m.acao, descricao: m.descricao, fundamento: m.fundamento, de: m.estadoAnterior, para: m.estadoNovo, em: m.em, usuarioId: m.usuarioId })),
    }
  }

  async editar(camaraId: string, u: UsuarioToken, id: string, dto: EditarProposicaoDto) {
    const p = await this.prisma.proposicao.findFirst({ where: { id, camaraId } })
    if (!p) throw new NotFoundException('Proposição não encontrada.')
    if (p.estado !== 'rascunho') throw new ConflictException('Após o protocolo o texto não pode ser alterado; utilize emenda ou substitutivo.')
    this.exigirAutoria(u, p.autorParlamentarId, p.criadoPorId)
    const t = { ...(p.tramitacao as unknown as Tramitacao), materias: dto.materias ?? p.materias }
    await this.prisma.proposicao.update({
      where: { id },
      data: { ementa: dto.ementa, texto: dto.texto, materias: t.materias, tramitacao: json(t) },
    })
    return this.detalhar(camaraId, id)
  }

  private exigirAutoria(u: UsuarioToken, autorParlamentarId: string | null, criadoPorId: string) {
    if (ehGabinete(u)) {
      if (!autorParlamentarId || autorParlamentarId !== u.parlamentarId) throw new ForbiddenException('Proposição de outro gabinete.')
    } else if (criadoPorId !== u.sub && !u.papeis.includes('servidor')) {
      throw new ForbiddenException('Somente o autor ou a Secretaria podem alterar este rascunho.')
    }
  }

  async executar(camaraId: string, u: UsuarioToken, id: string, corpo: Record<string, unknown>) {
    const tipo = corpo?.tipo as TipoAcao
    const permitidos = PERMISSAO_ACAO[tipo]
    if (!permitidos) throw new BadRequestException(`Ação desconhecida: "${String(corpo?.tipo)}".`)
    if (!permitidos.some(p => u.papeis.includes(p))) throw new ForbiddenException(`Ação "${tipo}" restrita a: ${permitidos.join(', ')}.`)

    const p = await this.prisma.proposicao.findFirst({ where: { id, camaraId }, include: { especie: true } })
    if (!p) throw new NotFoundException('Proposição não encontrada.')
    if (ACOES_DO_AUTOR.includes(tipo) && ehGabinete(u)) this.exigirAutoria(u, p.autorParlamentarId, p.criadoPorId)

    const camara = await this.prisma.camara.findUniqueOrThrow({ where: { id: camaraId } })
    const regras = camara.regras as unknown as RegrasCasa
    const config = p.especie.config as unknown as EspecieConfig
    const t = p.tramitacao as unknown as Tramitacao
    const acao = { ...corpo, data: typeof corpo.data === 'string' ? corpo.data : hoje() } as Acao

    if (acao.tipo === 'registrar_parecer' && typeof acao.comissao === 'string' && !(await this.prisma.comissao.findFirst({ where: { camaraId, sigla: acao.comissao } }))) {
      throw new UnprocessableEntityException({ message: 'Ação recusada pelo rito.', erros: [`Comissão "${acao.comissao}" não cadastrada.`] })
    }

    const r = aplicar(config, regras, t, acao)
    if (!r.ok) throw new UnprocessableEntityException({ message: 'Ação recusada pelo rito.', erros: r.erros })

    await this.prisma.$transaction(async tx => {
      const extra: Prisma.ProposicaoUpdateManyMutationInput = {}
      if (tipo === 'protocolar') {
        // Bloqueio por Câmara+espécie para numeração sem lacunas nem duplicidade.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${camaraId + ':' + p.especieId}))`
        const existentes = await tx.proposicao.findMany({
          where: { camaraId, especieId: p.especieId, numero: { not: null } },
          select: { numero: true, ano: true },
        })
        const ano = Number(acao.data.slice(0, 4))
        extra.ano = ano
        extra.numero = proximoNumero(config, existentes as { numero: number; ano: number }[], ano)
        extra.hashTexto = createHash('sha256').update(p.texto, 'utf8').digest('hex')
        extra.protocoladaEm = new Date()
      }
      // Concorrência otimista: só grava se ninguém alterou o estado desde a leitura.
      const atualizado = await tx.proposicao.updateMany({
        where: { id, estado: t.estado },
        data: { ...extra, estado: r.tramitacao.estado, tramitacao: json(r.tramitacao) },
      })
      if (!atualizado.count) throw new ConflictException('A proposição foi alterada por outro usuário. Recarregue e tente novamente.')
      await tx.movimentacao.create({
        data: {
          camaraId, proposicaoId: id, acao: tipo, dados: json(acao), descricao: r.descricao, fundamento: r.fundamento,
          estadoAnterior: t.estado, estadoNovo: r.tramitacao.estado, usuarioId: u.sub,
        },
      })
    })
    return this.detalhar(camaraId, id)
  }
}
