import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { authenticator } from 'otplib'
import type { Papel, UsuarioToken } from '../comum/papeis'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './auth.dto'

authenticator.options = { window: 1 }

const FALHA = 'E-mail, senha ou Câmara inválidos.'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  static async hash(senha: string) {
    return bcrypt.hash(senha, 12)
  }

  async login(dto: LoginDto) {
    let camaraId: string | null = null
    let exigirMfa = true
    if (dto.camara) {
      const camara = await this.prisma.camara.findUnique({ where: { slug: dto.camara } })
      if (!camara || !camara.ativa) throw new UnauthorizedException(FALHA)
      camaraId = camara.id
      exigirMfa = camara.exigirMfa
    }
    const usuario = await this.prisma.usuario.findFirst({
      where: { email: dto.email.toLowerCase(), camaraId, ativo: true },
    })
    // Compara mesmo quando o usuário não existe, para não revelar e-mails cadastrados pelo tempo de resposta.
    const ok = await bcrypt.compare(dto.senha, usuario?.senhaHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva')
    if (!usuario || !ok) throw new UnauthorizedException(FALHA)

    const papeis = usuario.papeis as Papel[]
    if (papeis.includes('plataforma')) exigirMfa = true

    let escopo: UsuarioToken['escopo'] = 'completo'
    if (usuario.mfaAtivo) {
      if (!dto.codigo) throw new UnauthorizedException({ message: 'Informe o código do autenticador.', mfaNecessario: true })
      if (!authenticator.check(dto.codigo, usuario.mfaSecret!)) throw new UnauthorizedException('Código de autenticação inválido.')
    } else if (exigirMfa) {
      escopo = 'configurar_mfa'
    }

    await this.prisma.usuario.update({ where: { id: usuario.id }, data: { ultimoLogin: new Date() } })
    const payload: UsuarioToken = { sub: usuario.id, camaraId: usuario.camaraId, papeis, parlamentarId: usuario.parlamentarId, escopo }
    return {
      token: await this.jwt.signAsync(payload),
      escopo,
      usuario: { id: usuario.id, nome: usuario.nome, papeis, camaraId: usuario.camaraId, parlamentarId: usuario.parlamentarId },
    }
  }

  async iniciarMfa(usuarioId: string) {
    const u = await this.prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } })
    if (u.mfaAtivo) throw new BadRequestException('A autenticação em dois fatores já está ativa.')
    const segredo = authenticator.generateSecret()
    await this.prisma.usuario.update({ where: { id: usuarioId }, data: { mfaSecret: segredo } })
    return { segredo, otpauth: authenticator.keyuri(u.email, 'Camara 360', segredo) }
  }

  async confirmarMfa(usuarioId: string, codigo: string) {
    const u = await this.prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } })
    if (!u.mfaSecret) throw new BadRequestException('Inicie a configuração antes de confirmar.')
    if (!authenticator.check(codigo, u.mfaSecret)) throw new BadRequestException('Código inválido.')
    await this.prisma.usuario.update({ where: { id: usuarioId }, data: { mfaAtivo: true } })
    return { mfaAtivo: true, mensagem: 'Autenticação em dois fatores ativada. Faça login novamente.' }
  }

  async trocarSenha(usuarioId: string, atual: string, nova: string) {
    const u = await this.prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } })
    if (!(await bcrypt.compare(atual, u.senhaHash))) throw new UnauthorizedException('Senha atual incorreta.')
    await this.prisma.usuario.update({ where: { id: usuarioId }, data: { senhaHash: await AuthService.hash(nova) } })
    return { ok: true }
  }
}
