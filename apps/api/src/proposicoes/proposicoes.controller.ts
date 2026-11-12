import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common'
import { camaraDo } from '../comum/camara'
import { Usuario } from '../comum/decoradores'
import type { UsuarioToken } from '../comum/papeis'
import { CriarProposicaoDto, EditarProposicaoDto } from './proposicoes.dto'
import { ProposicoesService } from './proposicoes.service'

@Controller('proposicoes')
export class ProposicoesController {
  constructor(private s: ProposicoesService) {}

  @Get()
  listar(@Usuario() u: UsuarioToken, @Query('estado') estado?: string, @Query('especie') especie?: string) {
    return this.s.listar(camaraDo(u), { estado, especie })
  }

  @Post()
  criar(@Usuario() u: UsuarioToken, @Body() dto: CriarProposicaoDto) {
    return this.s.criar(camaraDo(u), u, dto)
  }

  @Get(':id')
  detalhar(@Usuario() u: UsuarioToken, @Param('id', ParseUUIDPipe) id: string) {
    return this.s.detalhar(camaraDo(u), id)
  }

  @Patch(':id')
  editar(@Usuario() u: UsuarioToken, @Param('id', ParseUUIDPipe) id: string, @Body() dto: EditarProposicaoDto) {
    return this.s.editar(camaraDo(u), u, id, dto)
  }

  /** Executa um ato de tramitação. Corpo: { "tipo": "protocolar", "data": "2026-11-12", ... } */
  @Post(':id/acoes')
  acao(@Usuario() u: UsuarioToken, @Param('id', ParseUUIDPipe) id: string, @Body() corpo: Record<string, unknown>) {
    return this.s.executar(camaraDo(u), u, id, corpo)
  }
}
