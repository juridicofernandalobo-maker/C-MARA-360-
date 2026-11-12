import { ForbiddenException } from '@nestjs/common'
import type { UsuarioToken } from './papeis'

/** Garante que o usuário pertence a uma Câmara e devolve o identificador (isolamento entre instituições). */
export function camaraDo(u: UsuarioToken): string {
  if (!u.camaraId) throw new ForbiddenException('Operação disponível apenas para usuários de uma Câmara.')
  return u.camaraId
}
