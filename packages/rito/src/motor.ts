import { depois, diasCorridos, somarDiasUteis } from './datas'
import { apurar, minimoMembros, validarVotos } from './quorum'
import type { Acao, EspecieConfig, Estado, RegrasCasa, Resultado, TipoAutor, Tramitacao } from './tipos'

const ESTADOS_FINAIS: Estado[] = ['rejeitada', 'publicada', 'encaminhada_executivo', 'arquivada', 'retirada']

export function novaTramitacao(
  autorTipo: TipoAutor,
  opcoes: { regime?: Tramitacao['regime']; materias?: string[] } = {},
): Tramitacao {
  return { estado: 'rascunho', autorTipo, materias: opcoes.materias ?? [], regime: opcoes.regime ?? 'ordinario', turnoAtual: 1, pareceres: {} }
}

/** Verifica a iniciativa da espécie e as matérias de iniciativa privativa. */
export function verificarIniciativa(especie: EspecieConfig, regras: RegrasCasa, t: Tramitacao): string[] {
  const erros: string[] = []
  if (!especie.iniciativa.includes(t.autorTipo)) {
    erros.push(
      `Vício de iniciativa: ${especie.nome} não admite autoria de "${t.autorTipo}" ` +
        `(iniciativa permitida: ${especie.iniciativa.join(', ')}).`,
    )
  }
  for (const [titular, materias] of Object.entries(regras.iniciativaPrivativa)) {
    if (titular === t.autorTipo || !materias) continue
    const invadidas = t.materias.filter(m => materias.includes(m))
    if (invadidas.length) {
      erros.push(`Vício de iniciativa: matéria(s) ${invadidas.join(', ')} de iniciativa privativa de "${titular}".`)
    }
  }
  return erros
}

function falha(...erros: string[]): Resultado {
  return { ok: false, erros }
}

function exigeEstado(t: Tramitacao, permitidos: Estado[], acao: string): string | null {
  return permitidos.includes(t.estado)
    ? null
    : `Ação "${acao}" não é permitida no estado "${t.estado}" (permitido em: ${permitidos.join(', ')}).`
}

/**
 * Aplica uma ação à tramitação, verificando as regras da espécie e da Casa.
 * Função pura: não altera a entrada; devolve a nova tramitação ou a lista de impedimentos.
 */
export function aplicar(especie: EspecieConfig, regras: RegrasCasa, t: Tramitacao, acao: Acao): Resultado {
  const ok = (estado: Partial<Tramitacao>, descricao: string, fundamento = especie.fundamento): Resultado => ({
    ok: true,
    tramitacao: { ...t, pareceres: { ...t.pareceres }, ...estado },
    descricao,
    fundamento,
  })

  if (!acao.data || !/^\d{4}-\d{2}-\d{2}/.test(acao.data)) return falha('Data da ação ausente ou inválida (use AAAA-MM-DD).')

  switch (acao.tipo) {
    case 'protocolar': {
      const e = exigeEstado(t, ['rascunho'], acao.tipo)
      if (e) return falha(e)
      const vicios = verificarIniciativa(especie, regras, t)
      if (vicios.length) return falha(...vicios)
      return ok({ estado: 'protocolada' }, 'Proposição protocolada.')
    }

    case 'ler': {
      const e = exigeEstado(t, ['protocolada'], acao.tipo)
      if (e) return falha(e)
      return ok({ estado: 'lida' }, 'Lida no Expediente.')
    }

    case 'distribuir': {
      const e = exigeEstado(t, especie.leituraObrigatoria ? ['lida'] : ['protocolada', 'lida'], acao.tipo)
      if (e) return falha(e)
      if (!especie.deliberacaoPlenario) return falha(`${especie.nome} não é submetida a deliberação; não há distribuição a comissões.`)
      if (especie.comissoes.length === 0) return ok({ estado: 'pronta_para_pauta' }, 'Sem comissões obrigatórias; pronta para a Ordem do Dia.')
      const prazo = t.regime === 'urgencia' ? regras.prazoParecerUrgenciaDiasUteis : especie.prazoParecerDiasUteis
      const prazoParecer = somarDiasUteis(acao.data, prazo, regras.feriados)
      const pareceres = Object.fromEntries(especie.comissoes.map(c => [c, null]))
      return ok(
        { estado: 'em_comissao', pareceres, prazoParecer },
        `Distribuída às comissões: ${especie.comissoes.join(', ')}. Prazo para parecer: ${prazoParecer}.`,
      )
    }

    case 'registrar_parecer': {
      const e = exigeEstado(t, ['em_comissao'], acao.tipo)
      if (e) return falha(e)
      if (acao.sentido !== 'favoravel' && acao.sentido !== 'contrario') return falha('Sentido do parecer deve ser "favoravel" ou "contrario".')
      if (typeof acao.comissao !== 'string' || !(acao.comissao in t.pareceres)) return falha(`A comissão "${acao.comissao}" não está entre as competentes para esta matéria.`)
      if (t.pareceres[acao.comissao] !== null) return falha(`A comissão "${acao.comissao}" já emitiu parecer.`)
      const pareceres = { ...t.pareceres, [acao.comissao]: acao.sentido }
      const todos = Object.values(pareceres).every(p => p !== null)
      return {
        ok: true,
        tramitacao: { ...t, pareceres, estado: todos ? 'pronta_para_pauta' : 'em_comissao' },
        descricao: `Parecer ${acao.sentido} da ${acao.comissao}.${todos ? ' Pareceres concluídos; pronta para a Ordem do Dia.' : ''}`,
        fundamento: especie.fundamento,
      }
    }

    case 'incluir_pauta': {
      const sem_comissao = especie.comissoes.length === 0 && t.estado === 'lida' && especie.deliberacaoPlenario
      if (t.estado === 'em_comissao') {
        if (!regras.pautaSemParecerAposPrazo) return falha('Há pareceres pendentes e o Regimento não permite inclusão em pauta sem parecer.')
        if (!t.prazoParecer || !depois(acao.data, t.prazoParecer)) {
          return falha(`Há pareceres pendentes e o prazo das comissões (${t.prazoParecer}) ainda não venceu.`)
        }
        return ok({ estado: 'em_pauta' }, 'Incluída na Ordem do Dia sem parecer, por decurso do prazo das comissões.')
      }
      if (t.estado === 'aguardando_turno') {
        const decorridos = t.dataUltimaVotacao ? diasCorridos(t.dataUltimaVotacao, acao.data) : 0
        if (decorridos < especie.intersticioDias) {
          return falha(`Interstício não cumprido: ${decorridos} dia(s) desde o turno anterior; exigidos ${especie.intersticioDias}.`)
        }
        return ok({ estado: 'em_pauta' }, `Incluída na Ordem do Dia para o ${t.turnoAtual}º turno.`)
      }
      if (t.estado !== 'pronta_para_pauta' && !sem_comissao) {
        return falha(exigeEstado(t, ['pronta_para_pauta', 'aguardando_turno', 'em_comissao'], acao.tipo)!)
      }
      return ok({ estado: 'em_pauta' }, 'Incluída na Ordem do Dia.')
    }

    case 'votar': {
      const e = exigeEstado(t, ['em_pauta'], acao.tipo)
      if (e) return falha(e)
      if (!acao.votos) return falha('Informe o resultado da votação (presentes, sim, nao, abstencao).')
      const ev = validarVotos(acao.votos, regras.totalMembros)
      if (ev.length) return falha(...ev)
      const minPresenca = minimoMembros(regras.quorumDeliberacao, regras.totalMembros)
      if (acao.votos.presentes < minPresenca) {
        return falha(`Sem quórum para deliberar: ${acao.votos.presentes} presentes; mínimo de ${minPresenca}.`)
      }
      const ap = apurar(especie.quorumAprovacao, acao.votos, regras.totalMembros)
      const placar = `${acao.votos.sim} sim, ${acao.votos.nao} não, ${acao.votos.abstencao} abstenção`
      const turno = especie.turnos > 1 ? ` em ${t.turnoAtual}º turno` : ''
      if (!ap.aprovado) {
        return ok({ estado: 'rejeitada', dataUltimaVotacao: acao.data }, `Rejeitada${turno} (${placar}). Exigido: ${ap.exigido}.`)
      }
      if (t.turnoAtual < especie.turnos) {
        return ok(
          { estado: 'aguardando_turno', turnoAtual: t.turnoAtual + 1, dataUltimaVotacao: acao.data },
          `Aprovada${turno} (${placar}). Aguardando ${t.turnoAtual + 1}º turno, interstício de ${especie.intersticioDias} dia(s).`,
        )
      }
      return ok({ estado: 'aprovada', dataUltimaVotacao: acao.data }, `Aprovada${turno} (${placar}). Exigido: ${ap.exigido}.`)
    }

    case 'aprovar_redacao_final': {
      const e = exigeEstado(t, ['aprovada'], acao.tipo)
      if (e) return falha(e)
      if (!especie.geraNorma) {
        return falha(`${especie.nome} não gera norma jurídica; não há redação final.`)
      }
      return ok({ estado: 'redacao_final' }, 'Redação final aprovada.')
    }

    case 'enviar_sancao': {
      const e = exigeEstado(t, ['redacao_final'], acao.tipo)
      if (e) return falha(e)
      if (!especie.sujeitaSancao) return falha(`${especie.nome} não está sujeita a sanção; deve ser promulgada pela Câmara.`)
      const prazoSancao = somarDiasUteis(acao.data, regras.prazoSancaoDiasUteis, regras.feriados)
      return ok({ estado: 'aguardando_sancao', prazoSancao }, `Autógrafo enviado ao Prefeito. Prazo para sanção ou veto: ${prazoSancao}.`)
    }

    case 'sancionar': {
      const e = exigeEstado(t, ['aguardando_sancao'], acao.tipo)
      if (e) return falha(e)
      return ok({ estado: 'sancionada' }, 'Sancionada pelo Prefeito.')
    }

    case 'registrar_sancao_tacita': {
      const e = exigeEstado(t, ['aguardando_sancao'], acao.tipo)
      if (e) return falha(e)
      if (!t.prazoSancao || !depois(acao.data, t.prazoSancao)) {
        return falha(`Sanção tácita só após o fim do prazo (${t.prazoSancao}).`)
      }
      return ok({ estado: 'sancionada' }, 'Sanção tácita: decorrido o prazo sem manifestação do Prefeito.', 'Simetria com a CF, art. 66, §3º')
    }

    case 'vetar': {
      const e = exigeEstado(t, ['aguardando_sancao'], acao.tipo)
      if (e) return falha(e)
      if (t.prazoSancao && depois(acao.data, t.prazoSancao)) {
        return falha(`Veto intempestivo: o prazo terminou em ${t.prazoSancao}.`)
      }
      return ok({ estado: 'vetada' }, `Veto ${acao.parcial ? 'parcial' : 'total'} do Prefeito recebido.`, 'Simetria com a CF, art. 66, §1º')
    }

    case 'apreciar_veto': {
      const e = exigeEstado(t, ['vetada'], acao.tipo)
      if (e) return falha(e)
      if (!acao.votos) return falha('Informe o resultado da votação do veto.')
      const ev = validarVotos(acao.votos, regras.totalMembros)
      if (ev.length) return falha(...ev)
      const ap = apurar(regras.quorumRejeicaoVeto, acao.votos, regras.totalMembros)
      const placar = `${acao.votos.sim} pela rejeição, ${acao.votos.nao} pela manutenção`
      return ap.aprovado
        ? ok({ estado: 'veto_rejeitado' }, `Veto rejeitado (${placar}). Projeto segue para promulgação.`, 'Simetria com a CF, art. 66, §4º')
        : ok({ estado: 'arquivada' }, `Veto mantido (${placar}; exigido ${ap.exigido} para rejeitar).`, 'Simetria com a CF, art. 66, §4º')
    }

    case 'promulgar': {
      if (t.estado === 'redacao_final' && especie.sujeitaSancao) return falha('Projeto sujeito a sanção: envie ao Prefeito antes de promulgar.')
      const e = exigeEstado(t, ['redacao_final', 'veto_rejeitado'], acao.tipo)
      if (e) return falha(e)
      return ok({ estado: 'promulgada' }, 'Promulgada.')
    }

    case 'publicar': {
      const e = exigeEstado(t, ['sancionada', 'promulgada'], acao.tipo)
      if (e) return falha(e)
      return ok({ estado: 'publicada' }, 'Publicada no órgão oficial.')
    }

    case 'encaminhar_executivo': {
      if (!especie.encaminhaExecutivo) return falha(`${especie.nome} não é encaminhada ao Executivo.`)
      const permitidos: Estado[] = especie.deliberacaoPlenario ? ['aprovada'] : especie.leituraObrigatoria ? ['lida'] : ['protocolada', 'lida']
      const e = exigeEstado(t, permitidos, acao.tipo)
      if (e) return falha(e)
      return ok({ estado: 'encaminhada_executivo' }, 'Encaminhada ao Poder Executivo.')
    }

    case 'retirar': {
      const e = exigeEstado(t, ['rascunho', 'protocolada', 'lida', 'em_comissao', 'pronta_para_pauta'], acao.tipo)
      if (e) return falha(e)
      return ok({ estado: 'retirada' }, 'Retirada pelo autor.')
    }

    case 'arquivar': {
      if (ESTADOS_FINAIS.includes(t.estado)) return falha(`A proposição já está em estado final ("${t.estado}").`)
      if (!acao.motivo?.trim()) return falha('Informe o motivo do arquivamento.')
      return ok({ estado: 'arquivada' }, `Arquivada: ${acao.motivo}.`)
    }

    default: {
      const desconhecida: never = acao
      return falha(`Ação desconhecida: ${JSON.stringify(desconhecida)}`)
    }
  }
}

/** Ações candidatas por estado (a validação definitiva é sempre feita por `aplicar`). */
const CANDIDATAS: Record<Estado, Acao['tipo'][]> = {
  rascunho: ['protocolar', 'retirar'],
  protocolada: ['ler', 'distribuir', 'encaminhar_executivo', 'retirar', 'arquivar'],
  lida: ['distribuir', 'incluir_pauta', 'encaminhar_executivo', 'retirar', 'arquivar'],
  em_comissao: ['registrar_parecer', 'incluir_pauta', 'retirar', 'arquivar'],
  pronta_para_pauta: ['incluir_pauta', 'retirar', 'arquivar'],
  em_pauta: ['votar', 'arquivar'],
  aguardando_turno: ['incluir_pauta', 'arquivar'],
  aprovada: ['aprovar_redacao_final', 'encaminhar_executivo', 'arquivar'],
  redacao_final: ['enviar_sancao', 'promulgar', 'arquivar'],
  aguardando_sancao: ['sancionar', 'vetar', 'registrar_sancao_tacita'],
  vetada: ['apreciar_veto'],
  veto_rejeitado: ['promulgar'],
  sancionada: ['publicar'],
  promulgada: ['publicar'],
  rejeitada: [],
  publicada: [],
  encaminhada_executivo: [],
  arquivada: [],
  retirada: [],
}

/** Ações disponíveis no estado atual, já filtradas pelas características da espécie. */
export function acoesPossiveis(especie: EspecieConfig, t: Tramitacao): Acao['tipo'][] {
  return CANDIDATAS[t.estado].filter(tipo => {
    switch (tipo) {
      case 'ler':
        return especie.leituraObrigatoria
      case 'distribuir':
        return especie.deliberacaoPlenario && (t.estado === 'lida' || !especie.leituraObrigatoria)
      case 'incluir_pauta':
        return t.estado !== 'lida' || (especie.deliberacaoPlenario && especie.comissoes.length === 0)
      case 'encaminhar_executivo':
        if (!especie.encaminhaExecutivo) return false
        if (especie.deliberacaoPlenario) return t.estado === 'aprovada'
        return t.estado === 'lida' || !especie.leituraObrigatoria
      case 'aprovar_redacao_final':
        return especie.geraNorma
      case 'enviar_sancao':
        return especie.sujeitaSancao
      case 'promulgar':
        return t.estado === 'veto_rejeitado' || !especie.sujeitaSancao
      default:
        return true
    }
  })
}

/** Alertas de prazo para o painel (parecer vencido, sanção tácita disponível). */
export function alertasDePrazo(t: Tramitacao, hoje: string): string[] {
  const a: string[] = []
  if (t.estado === 'em_comissao' && t.prazoParecer && depois(hoje, t.prazoParecer)) {
    const pend = Object.entries(t.pareceres).filter(([, v]) => v === null).map(([k]) => k)
    a.push(`Prazo de parecer vencido em ${t.prazoParecer} (pendente: ${pend.join(', ')}).`)
  }
  if (t.estado === 'aguardando_sancao' && t.prazoSancao && depois(hoje, t.prazoSancao)) {
    a.push(`Prazo de sanção esgotado em ${t.prazoSancao}: cabe registrar a sanção tácita.`)
  }
  return a
}
