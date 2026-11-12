import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { PAPEIS_KEY, PUBLICO, SEM_MFA } from '../comum/decoradores'
import type { Papel, UsuarioToken } from '../comum/papeis'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const alvo = [ctx.getHandler(), ctx.getClass()]
    if (this.reflector.getAllAndOverride<boolean>(PUBLICO, alvo)) return true

    const req = ctx.switchToHttp().getRequest()
    const [tipo, token] = (req.headers.authorization ?? '').split(' ')
    if (tipo !== 'Bearer' || !token) throw new UnauthorizedException('Token ausente.')

    let usuario: UsuarioToken
    try {
      usuario = await this.jwt.verifyAsync<UsuarioToken>(token)
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.')
    }
    req.usuario = usuario

    if (usuario.escopo !== 'completo' && !this.reflector.getAllAndOverride<boolean>(SEM_MFA, alvo)) {
      throw new ForbiddenException('Ative a autenticação em dois fatores para continuar.')
    }

    const exigidos = this.reflector.getAllAndOverride<Papel[]>(PAPEIS_KEY, alvo)
    if (exigidos?.length && !exigidos.some(p => usuario.papeis.includes(p))) {
      throw new ForbiddenException(`Acesso restrito a: ${exigidos.join(', ')}.`)
    }
    return true
  }
}
