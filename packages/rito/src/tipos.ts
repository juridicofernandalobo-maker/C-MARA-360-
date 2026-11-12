/**
 * Tipos do motor de ritos. Nada aqui é "embutido": todo rito vem da configuração
 * extraída da Lei Orgânica Municipal (LOM) e do Regimento Interno (RI) de cada Câmara.
 */

/** simples: maioria dos votos, presente a maioria absoluta; absoluta: 1º número inteiro acima da metade dos membros; dois_tercos: 2/3 dos membros. */
export type Quorum = 'simples' | 'absoluta' | 'dois_tercos'

export type TipoAutor = 'vereador' | 'mesa' | 'comissao' | 'prefeito' | 'iniciativa_popular'

export type Estado =
  | 'rascunho'
  | 'protocolada'
  | 'lida'
  | 'em_comissao'
  | 'pronta_para_pauta'
  | 'em_pauta'
  | 'aguardando_turno'
  | 'aprovada'
  | 'rejeitada'
  | 'redacao_final'
  | 'aguardando_sancao'
  | 'sancionada'
  | 'vetada'
  | 'veto_rejeitado'
  | 'promulgada'
  | 'publicada'
  | 'encaminhada_executivo'
  | 'arquivada'
  | 'retirada'

export type Regime = 'ordinario' | 'urgencia'

/** Parâmetros de uma espécie de proposição (PLO, PLC, PR, PDL, PELO, IND, REQ, MOC…). */
export interface EspecieConfig {
  sigla: string
  nome: string
  /** Quem pode apresentar. */
  iniciativa: TipoAutor[]
  /** Deliberação em plenário? (ex.: indicação normalmente é apenas lida e encaminhada) */
  deliberacaoPlenario: boolean
  /** Exige leitura em plenário (Expediente) antes de seguir. */
  leituraObrigatoria: boolean
  /** Siglas das comissões cujo parecer é obrigatório. */
  comissoes: string[]
  quorumAprovacao: Quorum
  turnos: number
  /** Interstício mínimo, em dias corridos, entre turnos. */
  intersticioDias: number
  /** Resulta em norma (lei, resolução, decreto legislativo, emenda à LOM). Moção, indicação e requerimento: não. */
  geraNorma: boolean
  /** Projeto de lei: vai à sanção do Prefeito. Resolução/decreto legislativo/emenda à LOM: promulgação pela Câmara. */
  sujeitaSancao: boolean
  /** Após aprovação (ou leitura, se não houver deliberação), é encaminhada ao Executivo. */
  encaminhaExecutivo: boolean
  prazoParecerDiasUteis: number
  numeracao: 'anual' | 'continua'
  /** Referência normativa local (artigos da LOM/RI) — exibida nas decisões do motor. */
  fundamento?: string
}

/** Regras gerais da Casa. */
export interface RegrasCasa {
  totalMembros: number
  /** Presença mínima para deliberar. */
  quorumDeliberacao: Quorum
  prazoSancaoDiasUteis: number
  quorumRejeicaoVeto: Quorum
  /** Permite incluir em pauta sem parecer depois de vencido o prazo da comissão. */
  pautaSemParecerAposPrazo: boolean
  /** Prazo de parecer em regime de urgência (dias úteis). */
  prazoParecerUrgenciaDiasUteis: number
  /** Datas ISO (AAAA-MM-DD) de feriados e pontos facultativos. */
  feriados: string[]
  /**
   * Matérias de iniciativa privativa, por autor (ex.: { prefeito: ['orcamento', 'cargos_executivo'], mesa: ['cargos_camara'] }).
   * Proposição que trate dessas matérias só pode ser apresentada pelo titular da iniciativa.
   */
  iniciativaPrivativa: Partial<Record<TipoAutor, string[]>>
}

export type SentidoParecer = 'favoravel' | 'contrario'

/** Estado de tramitação de uma proposição (o que o motor lê e devolve). */
export interface Tramitacao {
  estado: Estado
  autorTipo: TipoAutor
  /** Classificação temática usada na verificação de iniciativa privativa. */
  materias: string[]
  regime: Regime
  turnoAtual: number
  pareceres: Record<string, SentidoParecer | null>
  prazoParecer?: string
  dataUltimaVotacao?: string
  prazoSancao?: string
}

export interface Votos {
  presentes: number
  sim: number
  nao: number
  abstencao: number
}

export type Acao =
  | { tipo: 'protocolar'; data: string }
  | { tipo: 'ler'; data: string }
  | { tipo: 'distribuir'; data: string }
  | { tipo: 'registrar_parecer'; data: string; comissao: string; sentido: SentidoParecer }
  | { tipo: 'incluir_pauta'; data: string }
  | { tipo: 'votar'; data: string; votos: Votos }
  | { tipo: 'aprovar_redacao_final'; data: string }
  | { tipo: 'enviar_sancao'; data: string }
  | { tipo: 'sancionar'; data: string }
  | { tipo: 'registrar_sancao_tacita'; data: string }
  | { tipo: 'vetar'; data: string; parcial?: boolean }
  | { tipo: 'apreciar_veto'; data: string; votos: Votos }
  | { tipo: 'promulgar'; data: string }
  | { tipo: 'publicar'; data: string }
  | { tipo: 'encaminhar_executivo'; data: string }
  | { tipo: 'retirar'; data: string }
  | { tipo: 'arquivar'; data: string; motivo: string }

export type TipoAcao = Acao['tipo']

export type Resultado =
  | { ok: true; tramitacao: Tramitacao; descricao: string; fundamento?: string }
  | { ok: false; erros: string[] }
