import { Body, Controller, Get, Injectable, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common'
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator'
import { camaraDo } from '../comum/camara'
import { Papeis, Usuario } from '../comum/decoradores'
import type { UsuarioToken } from '../comum/papeis'
import { PrismaService } from '../prisma/prisma.service'

export class ParlamentarDto {
  @IsString() @Length(2, 80) nomeParlamentar: string
  @IsString() @Length(3, 150) nomeCivil: string
  @IsOptional() @IsString() @Length(2, 20) partido?: string
}
export class AtualizarParlamentarDto {
  @IsOptional() @IsString() @Length(2, 80) nomeParlamentar?: string
  @IsOptional() @IsString() @Length(2, 20) partido?: string
  @IsOptional() @IsBoolean() ativo?: boolean
}

@Injectable()
export class ParlamentaresService {
  constructor(private prisma: PrismaService) {}
  listar(camaraId: string) {
    return this.prisma.parlamentar.findMany({ where: { camaraId }, orderBy: { nomeParlamentar: 'asc' } })
  }
  criar(camaraId: string, dto: ParlamentarDto) {
    return this.prisma.parlamentar.create({ data: { camaraId, ...dto } })
  }
  async atualizar(camaraId: string, id: string, dto: AtualizarParlamentarDto) {
    const r = await this.prisma.parlamentar.updateMany({ where: { id, camaraId }, data: dto })
    if (!r.count) throw new NotFoundException('Parlamentar não encontrado.')
    return this.prisma.parlamentar.findUnique({ where: { id } })
  }
}

@Controller('parlamentares')
export class ParlamentaresController {
  constructor(private s: ParlamentaresService) {}

  @Get()
  listar(@Usuario() u: UsuarioToken) {
    return this.s.listar(camaraDo(u))
  }

  @Papeis('presidente', 'mesa', 'administrador', 'servidor')
  @Post()
  criar(@Usuario() u: UsuarioToken, @Body() dto: ParlamentarDto) {
    return this.s.criar(camaraDo(u), dto)
  }

  @Papeis('presidente', 'mesa', 'administrador', 'servidor')
  @Patch(':id')
  atualizar(@Usuario() u: UsuarioToken, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizarParlamentarDto) {
    return this.s.atualizar(camaraDo(u), id, dto)
  }
}
