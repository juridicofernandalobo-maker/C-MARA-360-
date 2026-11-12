import type { EspecieConfig } from './tipos'

/** Próximo número da espécie: reinicia a cada ano (anual) ou segue sequência única (contínua). */
export function proximoNumero(especie: EspecieConfig, existentes: { numero: number; ano: number }[], ano: number): number {
  const base = especie.numeracao === 'anual' ? existentes.filter(e => e.ano === ano) : existentes
  return base.reduce((m, e) => Math.max(m, e.numero), 0) + 1
}
