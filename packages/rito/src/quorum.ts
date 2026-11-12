import type { Quorum, Votos } from './tipos'

/** Número mínimo de membros exigido pelo quórum. */
export function minimoMembros(q: Quorum, totalMembros: number): number {
  switch (q) {
    case 'simples':
    case 'absoluta':
      return Math.floor(totalMembros / 2) + 1
    case 'dois_tercos':
      return Math.ceil((totalMembros * 2) / 3)
  }
}

export interface Apuracao {
  aprovado: boolean
  exigido: string
}

/**
 * Apura a votação.
 * - simples: mais votos "sim" do que "não" entre os presentes (presença verificada à parte);
 * - absoluta / dois_tercos: votos "sim" ≥ mínimo calculado sobre o total de membros da Casa.
 */
export function apurar(q: Quorum, votos: Votos, totalMembros: number): Apuracao {
  if (q === 'simples') {
    return { aprovado: votos.sim > votos.nao, exigido: 'maioria simples dos votos' }
  }
  const min = minimoMembros(q, totalMembros)
  const nome = q === 'absoluta' ? 'maioria absoluta' : 'dois terços'
  return { aprovado: votos.sim >= min, exigido: `${nome} dos membros (${min} de ${totalMembros})` }
}

export function validarVotos(votos: Votos, totalMembros: number): string[] {
  const erros: string[] = []
  const nums = [votos.presentes, votos.sim, votos.nao, votos.abstencao]
  if (nums.some(n => !Number.isInteger(n) || n < 0)) erros.push('Votos devem ser números inteiros não negativos.')
  if (votos.presentes > totalMembros) erros.push(`Presentes (${votos.presentes}) excede o total de membros (${totalMembros}).`)
  if (votos.sim + votos.nao + votos.abstencao > votos.presentes) erros.push('A soma dos votos excede o número de presentes.')
  return erros
}
