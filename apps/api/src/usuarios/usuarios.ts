import {
  BadRequestException, Body, ConflictException, Controller, ForbiddenException, Get, Injectable, NotFoundException,
  Param, ParseUUIDPipe, Patch, Post,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { ArrayNotEmpty, IsArray, IsBoolean, IsEmail, IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator'
import { AuthService } from '../auth/auth.service'
import { camaraDo } from '../comum/camara'
import { Papeis, Usuario } from '../comum/decoradores'
import { PAPEIS, type Papel, type UsuarioToken } from '../comum/papeis'
import { PrismaService } from '../prisma/prisma.service'

const PAPEIS_DA_CAMARA = PAPEIS.filter(p => p !== 'plataforma')

export class CriarUsuarioDto {
  @IsString() @Length(3, 120) nome: string
  @IsEmail() email: string
  @IsString() @Length(10, 128) senha: string
  @IsArray() @ArrayNotEmpty() @IsIn(PAPEIS_DA_CAMARA, { each: true }) papeis: Papel[]
  @IsOptional() @IsUUID() parlamentarId?: string
}
export class AtualizarUsuarioDto {
  @IsOptional() @IsArray() @ArrayNotEmpty() @IsIn(PAPEIS_DA_CAMARA, { each: true }) papeis?: Papel[]
  @IsOptional() @IsBoolean() ativo?: boolean
}

const PUBLICO = { id: true, nome: true, email: true, papeis: true, parlamentarId: true, mfaAtivo: true, ativo: true, ultimoLogin: true } as const

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  listar(camaraId: string) {
    return this.prisma.usuario.findMany({ where: { camaraId }, select: PUBLICO, orderBy: { nome: 'asc' } })
  }

  async criar(camaraId: string, dto: CriarUsuarioDto) {
    const precisaGabinete = dto.papeis.includes('vereador') || dto.papeis.includes('assessor')
    if (precisaGabinete && !dto.parlamentarId) throw new BadRequestException('Vereador e assessor devem estar vinculados a um parlamentar.')
    if (dto.parlamentarId) {
      const p = await this.prisma.parlamentar.findFirst({ where: { id: dto.parlamentarId, camaraId } })
      if (!p) throw new BadRequestException('Parlamentar não pertence a esta Câmara.')
    }
    try {
      return await this.prisma.usuario.create({
        data: { camaraId, nome: dto.nome, email: dto.email.toLowerCase(), senhaHash: await AuthService.hash(dto.senha), papeis: dto.papeis, parlamentarId: dto.parlamentarId },
        select: PUBLICO,
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw new ConflictException('E-mail já cadastrado nesta Câmara.')
      throw e
    }
  }

  async atualizar(camaraId: string, id: string, autorId: string, dto: AtualizarUsuarioDto) {
    if (id === autorId && (dto.ativo === false || dto.papeis)) {
      throw new ForbiddenException('Não é permitido alterar os próprios papéis ou desativar a própria conta.')
    }
    const r = await this.prisma.usuario.updateMany({ where: { id, camaraId }, data: dto })
    if (!r.count) throw new NotFoundException('Usuário não encontrado.')
    return this.prisma.usuario.findUnique({ where: { id }, select: PUBLICO })
  }
}

@Controller('usuarios')
@Papeis('administrador', 'presidente')
export class UsuariosController {
  constructor(private s: UsuariosService) {}

  @Get()
  listar(@Usuario() u: UsuarioToken) {
    return this.s.listar(camaraDo(u))
  }

  @Post()
  criar(@Usuario() u: UsuarioToken, @Body() dto: CriarUsuarioDto) {
    return this.s.criar(camaraDo(u), dto)
  }

  @Patch(':id')
  atualizar(@Usuario() u: UsuarioToken, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizarUsuarioDto) {
    return this.s.atualizar(camaraDo(u), id, u.sub, dto)
  }
}
