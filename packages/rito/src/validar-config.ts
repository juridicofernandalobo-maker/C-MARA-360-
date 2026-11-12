import type { EspecieConfig, RegrasCasa } from './tipos'

/** Valida a coerência de uma configuração antes de gravá-la. */
export function validarEspecie(e: EspecieConfig): string[] {
  const erros: string[] = []
  if (!e || typeof e !== 'object') return ['Configuração ausente.']
  const booleanos = ['deliberacaoPlenario', 'leituraObrigatoria', 'geraNorma', 'sujeitaSancao', 'encaminhaExecutivo'] as const
  for (const b of booleanos) if (typeof e[b] !== 'boolean') erros.push(`Campo "${b}" deve ser verdadeiro ou falso.`)
  if (!Array.isArray(e.comissoes) || !Array.isArray(e.iniciativa)) return [...erros, 'Campos "comissoes" e "iniciativa" devem ser listas.']
  if (!['simples', 'absoluta', 'dois_tercos'].includes(e.quorumAprovacao)) erros.push('Quórum de aprovação inválido.')
  if (!['anual', 'continua'].includes(e.numeracao)) erros.push('Numeração deve ser "anual" ou "continua".')
  const autores = ['vereador', 'mesa', 'comissao', 'prefeito', 'iniciativa_popular']
  if (e.iniciativa.some(a => !autores.includes(a))) erros.push(`Iniciativa aceita apenas: ${autores.join(', ')}.`)
  if (!Number.isInteger(e.intersticioDias) || e.intersticioDias < 0) erros.push('Interstício inválido.')
  if (!Number.isInteger(e.prazoParecerDiasUteis) || e.prazoParecerDiasUteis < 0) erros.push('Prazo de parecer inválido.')
  if (!/^[A-Z]{2,6}$/.test(e.sigla)) erros.push('Sigla deve ter de 2 a 6 letras maiúsculas.')
  if (!e.nome?.trim()) erros.push('Nome é obrigatório.')
  if (!e.iniciativa?.length) erros.push('Informe ao menos um titular de iniciativa.')
  if (!Number.isInteger(e.turnos) || e.turnos < 1 || e.turnos > 3) erros.push('Turnos deve ser 1, 2 ou 3.')
  if (e.turnos > 1 && e.intersticioDias < 1) erros.push('Com mais de um turno, informe o interstício.')
  if (e.sujeitaSancao && !e.geraNorma) erros.push('Espécie sujeita a sanção precisa gerar norma.')
  if (e.sujeitaSancao && !e.deliberacaoPlenario) erros.push('Espécie sujeita a sanção precisa de deliberação em plenário.')
  if (!e.deliberacaoPlenario && e.comissoes.length) erros.push('Espécie sem deliberação não pode exigir parecer de comissão.')
  if (e.comissoes.length && e.prazoParecerDiasUteis < 1) erros.push('Informe o prazo de parecer das comissões.')
  return erros
}

export function validarRegras(r: RegrasCasa): string[] {
  const erros: string[] = []
  if (!r || typeof r !== 'object') return ['Regras ausentes.']
  const quoruns = ['simples', 'absoluta', 'dois_tercos']
  if (!quoruns.includes(r.quorumDeliberacao) || !quoruns.includes(r.quorumRejeicaoVeto)) erros.push('Quórum inválido.')
  if (typeof r.pautaSemParecerAposPrazo !== 'boolean') erros.push('Campo "pautaSemParecerAposPrazo" deve ser verdadeiro ou falso.')
  if (!Number.isInteger(r.prazoParecerUrgenciaDiasUteis) || r.prazoParecerUrgenciaDiasUteis < 1) erros.push('Prazo de urgência inválido.')
  if (!Array.isArray(r.feriados)) return [...erros, 'Feriados devem ser uma lista.']
  if (!r.iniciativaPrivativa || typeof r.iniciativaPrivativa !== 'object') erros.push('Informe "iniciativaPrivativa" (pode ser {}).')
  if (!Number.isInteger(r.totalMembros) || r.totalMembros < 9 || r.totalMembros > 55) {
    erros.push('Total de membros deve estar entre 9 e 55 (CF, art. 29, IV).')
  }
  if (r.prazoSancaoDiasUteis < 1) erros.push('Prazo de sanção inválido.')
  if (r.feriados.some(f => !/^\d{4}-\d{2}-\d{2}$/.test(f))) erros.push('Feriados devem estar no formato AAAA-MM-DD.')
  return erros
}
