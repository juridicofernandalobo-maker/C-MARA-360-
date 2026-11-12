import type { EspecieConfig, RegrasCasa } from './tipos'

/**
 * MODELO DE PARTIDA — não é o rito de nenhum município específico.
 * Reproduz padrões frequentes nas Leis Orgânicas, por simetria com a Constituição Federal.
 * Deve ser revisto artigo por artigo com a LOM e o Regimento Interno de cada Câmara antes do uso.
 */
export function regrasPadrao(totalMembros: number): RegrasCasa {
  return {
    totalMembros,
    quorumDeliberacao: 'absoluta',
    prazoSancaoDiasUteis: 15,
    quorumRejeicaoVeto: 'absoluta',
    pautaSemParecerAposPrazo: true,
    prazoParecerUrgenciaDiasUteis: 5,
    feriados: [],
    iniciativaPrivativa: {
      // Simetria com CF, art. 61, §1º, e art. 165
      prefeito: ['orcamento', 'ppa', 'ldo', 'loa', 'cargos_executivo', 'remuneracao_executivo', 'estrutura_administrativa', 'regime_juridico_servidores'],
      // Simetria com CF, art. 51, IV, e art. 52, XIII
      mesa: ['cargos_camara', 'remuneracao_servidores_camara'],
    },
  }
}

const todosAutores = ['vereador', 'mesa', 'comissao', 'prefeito', 'iniciativa_popular'] as const

export const especiesPadrao: EspecieConfig[] = [
  {
    sigla: 'PLO', nome: 'Projeto de Lei Ordinária', iniciativa: [...todosAutores],
    deliberacaoPlenario: true, leituraObrigatoria: true, comissoes: ['CCJ'], quorumAprovacao: 'simples',
    turnos: 1, intersticioDias: 0, geraNorma: true, sujeitaSancao: true, encaminhaExecutivo: false,
    prazoParecerDiasUteis: 15, numeracao: 'anual',
  },
  {
    sigla: 'PLC', nome: 'Projeto de Lei Complementar', iniciativa: [...todosAutores],
    deliberacaoPlenario: true, leituraObrigatoria: true, comissoes: ['CCJ', 'CFO'], quorumAprovacao: 'absoluta',
    turnos: 1, intersticioDias: 0, geraNorma: true, sujeitaSancao: true, encaminhaExecutivo: false,
    prazoParecerDiasUteis: 15, numeracao: 'anual', fundamento: 'Simetria com CF, art. 69',
  },
  {
    sigla: 'PELO', nome: 'Proposta de Emenda à Lei Orgânica', iniciativa: ['vereador', 'prefeito', 'iniciativa_popular'],
    deliberacaoPlenario: true, leituraObrigatoria: true, comissoes: ['CCJ'], quorumAprovacao: 'dois_tercos',
    turnos: 2, intersticioDias: 10, geraNorma: true, sujeitaSancao: false, encaminhaExecutivo: false,
    prazoParecerDiasUteis: 15, numeracao: 'anual', fundamento: 'CF, art. 29, caput (dois turnos, interstício de 10 dias, 2/3)',
  },
  {
    sigla: 'PR', nome: 'Projeto de Resolução', iniciativa: ['vereador', 'mesa', 'comissao'],
    deliberacaoPlenario: true, leituraObrigatoria: true, comissoes: ['CCJ'], quorumAprovacao: 'simples',
    turnos: 1, intersticioDias: 0, geraNorma: true, sujeitaSancao: false, encaminhaExecutivo: false,
    prazoParecerDiasUteis: 15, numeracao: 'anual',
  },
  {
    sigla: 'PDL', nome: 'Projeto de Decreto Legislativo', iniciativa: ['vereador', 'mesa', 'comissao'],
    deliberacaoPlenario: true, leituraObrigatoria: true, comissoes: ['CCJ'], quorumAprovacao: 'simples',
    turnos: 1, intersticioDias: 0, geraNorma: true, sujeitaSancao: false, encaminhaExecutivo: false,
    prazoParecerDiasUteis: 15, numeracao: 'anual',
  },
  {
    sigla: 'IND', nome: 'Indicação', iniciativa: ['vereador', 'comissao'],
    deliberacaoPlenario: false, leituraObrigatoria: true, comissoes: [], quorumAprovacao: 'simples',
    turnos: 1, intersticioDias: 0, geraNorma: false, sujeitaSancao: false, encaminhaExecutivo: true,
    prazoParecerDiasUteis: 0, numeracao: 'anual',
  },
  {
    sigla: 'REQ', nome: 'Requerimento', iniciativa: ['vereador', 'mesa', 'comissao'],
    deliberacaoPlenario: true, leituraObrigatoria: true, comissoes: [], quorumAprovacao: 'simples',
    turnos: 1, intersticioDias: 0, geraNorma: false, sujeitaSancao: false, encaminhaExecutivo: true,
    prazoParecerDiasUteis: 0, numeracao: 'anual', fundamento: 'Função fiscalizadora — CF, art. 31',
  },
  {
    sigla: 'MOC', nome: 'Moção', iniciativa: ['vereador', 'mesa', 'comissao'],
    deliberacaoPlenario: true, leituraObrigatoria: true, comissoes: [], quorumAprovacao: 'simples',
    turnos: 1, intersticioDias: 0, geraNorma: false, sujeitaSancao: false, encaminhaExecutivo: false,
    prazoParecerDiasUteis: 0, numeracao: 'anual',
  },
]
