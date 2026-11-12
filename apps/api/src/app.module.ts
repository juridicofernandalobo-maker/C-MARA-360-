import { Module } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AuditoriaController, AuditoriaInterceptor } from './auditoria/auditoria'
import { AuthController } from './auth/auth.controller'
import { AuthGuard } from './auth/auth.guard'
import { AuthService } from './auth/auth.service'
import { CamarasController } from './camaras/camaras.controller'
import { CamarasService } from './camaras/camaras.service'
import { ParlamentaresController, ParlamentaresService } from './parlamentares/parlamentares'
import { PrismaModule } from './prisma/prisma.service'
import { ProposicoesController } from './proposicoes/proposicoes.controller'
import { ProposicoesService } from './proposicoes/proposicoes.service'
import { UsuariosController, UsuariosService } from './usuarios/usuarios'

function segredoJwt(): string {
  const s = process.env.JWT_SECRET
  if (!s || (process.env.NODE_ENV === 'production' && s.length < 32)) {
    throw new Error('Defina JWT_SECRET (mínimo de 32 caracteres em produção).')
  }
  return s
}

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({ secret: segredoJwt(), signOptions: { expiresIn: process.env.JWT_EXPIRA_EM ?? '8h' } }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
  ],
  controllers: [AuthController, CamarasController, ParlamentaresController, UsuariosController, ProposicoesController, AuditoriaController],
  providers: [
    AuthService, CamarasService, ParlamentaresService, UsuariosService, ProposicoesService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditoriaInterceptor },
  ],
})
export class AppModule {}
