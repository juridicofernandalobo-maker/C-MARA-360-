export const PAPEIS = ['plataforma', 'administrador', 'presidente', 'mesa', 'vereador', 'assessor', 'servidor', 'procurador'] as const
export type Papel = (typeof PAPEIS)[number]

/** Dados do usuário autenticado, extraídos do token. */
export interface UsuarioToken {
  sub: string
  camaraId: string | null
  papeis: Papel[]
  parlamentarId: string | null
  /** 'completo' ou 'configurar_mfa' (acesso restrito até ativar o segundo fator). */
  escopo: 'completo' | 'configurar_mfa'
}
