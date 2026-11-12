import type { TipoAcao } from '@camara360/rito'
import type { Papel } from '../comum/papeis'

const SECRETARIA: Papel[] = ['presidente', 'mesa', 'servidor']

/**
 * Quem pode registrar cada ato no sistema.
 * Atos do Prefeito (sanção, veto) são registrados pela Secretaria Legislativa a partir do documento recebido.
 */
export const PERMISSAO_ACAO: Record<TipoAcao, Papel[]> = {
  protocolar: ['vereador', 'assessor', 'servidor'],
  retirar: ['vereador', 'assessor'],
  ler: SECRETARIA,
  distribuir: SECRETARIA,
  registrar_parecer: SECRETARIA,
  incluir_pauta: SECRETARIA,
  votar: SECRETARIA,
  aprovar_redacao_final: SECRETARIA,
  enviar_sancao: SECRETARIA,
  sancionar: SECRETARIA,
  registrar_sancao_tacita: SECRETARIA,
  vetar: SECRETARIA,
  apreciar_veto: SECRETARIA,
  promulgar: ['presidente', 'mesa'],
  publicar: SECRETARIA,
  encaminhar_executivo: SECRETARIA,
  arquivar: SECRETARIA,
}

/** Ações que o gabinete só pode praticar sobre proposição da própria autoria. */
export const ACOES_DO_AUTOR: TipoAcao[] = ['protocolar', 'retirar']
