import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { especiesPadrao, regrasPadrao, validarEspecie, validarRegras, type EspecieConfig, type RegrasCasa } from '@camara360/rito'
import { Prisma } from '@prisma/client'
import { AuthService } from '../auth/auth.service'
import { PrismaService } from '../prisma/prisma.service'
import { ComissaoDto, CriarCamaraDto } from './camaras.dto'

@Injectable()
export class CamarasService {
  constructor(private prisma: PrismaService) {}

  /** Cria a Câmara já com o modelo de partida de ritos (a ser revisto com a LOM e o RI locais). */
  async criar(dto: CriarCamaraDto) {
    const regras = regrasPadrao(dto.totalMembros)
    try {
      return await this.prisma.$transaction(async tx => {
        const camara = await tx.camara.create({
          data: {
            slug: dto.slug, nome: dto.nome, municipio: dto.municipio, uf: dto.uf, codigoIbge: dto.codigoIbge, cnpj: dto.cnpj,
            exigirMfa: dto.exigirMfa ?? true, regras: regras as unknown as Prisma.InputJsonValue,
          },
        })
        await tx.especieNormativa.createMany({
          data: especiesPadrao.map(e => ({ camaraId: camara.id, sigla: e.sigla, config: e as unknown as Prisma.InputJsonValue })),
        })
        await tx.comissao.createMany({
          data: [
            { camaraId: camara.id, sigla: 'CCJ', nome: 'Comissão de Constituição, Justiça e Redação' },
            { camaraId: camara.id, sigla: 'CFO', nome: 'Comissão de Finanças e Orçamento' },
          ],
        })
        await tx.usuario.create({
          data: {
            camaraId: camara.id, nome: dto.administrador.nome, email: dto.administrador.email.toLowerCase(),
            senhaHash: await AuthService.hash(dto.administrador.senha), papeis: ['administrador'],
          },
        })
        return camara
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Já existe Câmara com este slug, CNPJ ou código IBGE.')
      }
      throw e
    }
  }

  listarTodas() {
    return this.prisma.camara.findMany({ select: { id: true, slug: true, nome: true, municipio: true, uf: true, ativa: true }, orderBy: { nome: 'asc' } })
  }

  async obter(camaraId: string) {
    const c = await this.prisma.camara.findUnique({
      where: { id: camaraId },
      include: { comissoes: { orderBy: { sigla: 'asc' } }, especies: { orderBy: { sigla: 'asc' } } },
    })
    if (!c) throw new NotFoundException()
    return c
  }

  async atualizarRegras(camaraId: string, regras: RegrasCasa) {
    const erros = validarRegras(regras)
    if (erros.length) throw new UnprocessableEntityException({ message: 'Regras inválidas.', erros })
    return this.prisma.camara.update({ where: { id: camaraId }, data: { regras: regras as unknown as Prisma.InputJsonValue } })
  }

  async atualizarEspecie(camaraId: string, sigla: string, config: EspecieConfig) {
    if (config.sigla !== sigla) throw new UnprocessableEntityException('A sigla do corpo deve coincidir com a da rota.')
    const erros = validarEspecie(config)
    const comissoes = await this.prisma.comissao.findMany({ where: { camaraId }, select: { sigla: true } })
    const existentes = new Set(comissoes.map(c => c.sigla))
    for (const c of config.comissoes ?? []) if (!existentes.has(c)) erros.push(`Comissão "${c}" não cadastrada.`)
    if (erros.length) throw new UnprocessableEntityException({ message: 'Configuração inválida.', erros })
    return this.prisma.especieNormativa.upsert({
      where: { camaraId_sigla: { camaraId, sigla } },
      create: { camaraId, sigla, config: config as unknown as Prisma.InputJsonValue },
      update: { config: config as unknown as Prisma.InputJsonValue },
    })
  }

  async criarComissao(camaraId: string, dto: ComissaoDto) {
    try {
      return await this.prisma.comissao.create({ data: { camaraId, ...dto } })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw new ConflictException('Comissão já cadastrada.')
      throw e
    }
  }
}
