import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common'
import type { Papel, UsuarioToken } from './papeis'

export const PUBLICO = 'publico'
export const PAPEIS_KEY = 'papeis'
export const SEM_MFA = 'semMfa'

/** Rota acessível sem autenticação. */
export const Publico = () => SetMetadata(PUBLICO, true)
/** Restringe a rota aos papéis informados. */
export const Papeis = (...papeis: Papel[]) => SetMetadata(PAPEIS_KEY, papeis)
/** Rota acessível com token de escopo restrito (para cadastrar o segundo fator). */
export const PermitirSemMfa = () => SetMetadata(SEM_MFA, true)

export const Usuario = createParamDecorator((_: unknown, ctx: ExecutionContext): UsuarioToken => {
  return ctx.switchToHttp().getRequest().usuario
})
