import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { PermitirSemMfa, Publico, Usuario } from '../comum/decoradores'
import type { UsuarioToken } from '../comum/papeis'
import { ConfirmarMfaDto, LoginDto, TrocarSenhaDto } from './auth.dto'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Publico()
  // Limite de tentativas de login por IP (padrão: 10 por minuto).
  @Throttle({ default: { limit: () => Number(process.env.LOGIN_LIMITE_POR_MINUTO ?? 10), ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto)
  }

  @PermitirSemMfa()
  @Get('eu')
  eu(@Usuario() u: UsuarioToken) {
    return u
  }

  @PermitirSemMfa()
  @Post('mfa/iniciar')
  iniciarMfa(@Usuario() u: UsuarioToken) {
    return this.auth.iniciarMfa(u.sub)
  }

  @PermitirSemMfa()
  @Post('mfa/confirmar')
  @HttpCode(200)
  confirmarMfa(@Usuario() u: UsuarioToken, @Body() dto: ConfirmarMfaDto) {
    return this.auth.confirmarMfa(u.sub, dto.codigo)
  }

  @PermitirSemMfa()
  @Post('senha')
  @HttpCode(200)
  trocarSenha(@Usuario() u: UsuarioToken, @Body() dto: TrocarSenhaDto) {
    return this.auth.trocarSenha(u.sub, dto.senhaAtual, dto.novaSenha)
  }
}
