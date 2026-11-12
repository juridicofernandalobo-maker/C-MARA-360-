import { describe, expect, it } from 'vitest'
import {
  acoesPossiveis, alertasDePrazo, aplicar, apurar, especiesPadrao, minimoMembros, novaTramitacao,
  proximoNumero, regrasPadrao, somarDiasUteis, validarEspecie, validarRegras,
  type Acao, type EspecieConfig, type Tramitacao,
} from '../src'

const regras = regrasPadrao(11)
const esp = (sigla: string) => especiesPadrao.find(e => e.sigla === sigla)!

/** Aplica uma sequência de ações, falhando o teste se alguma for recusada. */
function executar(e: EspecieConfig, t: Tramitacao, acoes: Acao[], r = regras): Tramitacao {
  for (const a of acoes) {
    const res = aplicar(e, r, t, a)
    if (!res.ok) throw new Error(`${a.tipo}: ${res.erros.join(' | ')}`)
    t = res.tramitacao
  }
  return t
}
const votos = (presentes: number, sim: number, nao: number, abstencao = 0) => ({ presentes, sim, nao, abstencao })

describe('quórum (Câmara de 11 membros)', () => {
  it('maioria absoluta = 6; dois terços = 8', () => {
    expect(minimoMembros('absoluta', 11)).toBe(6)
    expect(minimoMembros('dois_tercos', 11)).toBe(8)
    expect(minimoMembros('dois_tercos', 9)).toBe(6)
    expect(minimoMembros('absoluta', 10)).toBe(6)
  })
  it('maioria simples considera apenas sim × não', () => {
    expect(apurar('simples', votos(6, 3, 2, 1), 11).aprovado).toBe(true)
    expect(apurar('simples', votos(6, 3, 3), 11).aprovado).toBe(false)
  })
  it('maioria absoluta conta sobre o total de membros, não sobre os presentes', () => {
    expect(apurar('absoluta', votos(7, 5, 2), 11).aprovado).toBe(false)
    expect(apurar('absoluta', votos(7, 6, 1), 11).aprovado).toBe(true)
  })
})

describe('prazos em dias úteis', () => {
  it('exclui o dia de início, fins de semana e feriados', () => {
    expect(somarDiasUteis('2026-11-12', 15, [])).toBe('2026-12-03')
    expect(somarDiasUteis('2026-11-12', 15, ['2026-11-20'])).toBe('2026-12-04')
  })
})

describe('Projeto de Lei Ordinária — ciclo completo', () => {
  it('protocolo → comissão → votação → sanção → publicação', () => {
    const t = executar(esp('PLO'), novaTramitacao('vereador'), [
      { tipo: 'protocolar', data: '2026-11-12' },
      { tipo: 'ler', data: '2026-11-13' },
      { tipo: 'distribuir', data: '2026-11-13' },
      { tipo: 'registrar_parecer', data: '2026-11-20', comissao: 'CCJ', sentido: 'favoravel' },
      { tipo: 'incluir_pauta', data: '2026-11-24' },
      { tipo: 'votar', data: '2026-11-24', votos: votos(9, 6, 3) },
      { tipo: 'aprovar_redacao_final', data: '2026-11-24' },
      { tipo: 'enviar_sancao', data: '2026-11-25' },
      { tipo: 'sancionar', data: '2026-12-01' },
      { tipo: 'publicar', data: '2026-12-02' },
    ])
    expect(t.estado).toBe('publicada')
  })

  it('não vota sem quórum de deliberação', () => {
    const t = executar(esp('PLO'), novaTramitacao('vereador'), [
      { tipo: 'protocolar', data: '2026-11-12' }, { tipo: 'ler', data: '2026-11-12' }, { tipo: 'distribuir', data: '2026-11-12' },
      { tipo: 'registrar_parecer', data: '2026-11-13', comissao: 'CCJ', sentido: 'favoravel' }, { tipo: 'incluir_pauta', data: '2026-11-16' },
    ])
    const r = aplicar(esp('PLO'), regras, t, { tipo: 'votar', data: '2026-11-16', votos: votos(5, 5, 0) })
    expect(r.ok).toBe(false)
    expect(!r.ok && r.erros[0]).toMatch(/Sem quórum/)
  })

  it('não pode ser promulgado pela Câmara sem passar pela sanção', () => {
    const t: Tramitacao = { ...novaTramitacao('vereador'), estado: 'redacao_final' }
    const r = aplicar(esp('PLO'), regras, t, { tipo: 'promulgar', data: '2026-11-12' })
    expect(r.ok).toBe(false)
  })
})

describe('iniciativa', () => {
  it('vereador não pode apresentar projeto sobre cargos do Executivo (vício de iniciativa)', () => {
    const t = novaTramitacao('vereador', { materias: ['cargos_executivo'] })
    const r = aplicar(esp('PLO'), regras, t, { tipo: 'protocolar', data: '2026-11-12' })
    expect(r.ok).toBe(false)
    expect(!r.ok && r.erros[0]).toMatch(/privativa de "prefeito"/)
  })
  it('o Prefeito pode apresentar a mesma matéria', () => {
    const t = novaTramitacao('prefeito', { materias: ['cargos_executivo'] })
    expect(aplicar(esp('PLO'), regras, t, { tipo: 'protocolar', data: '2026-11-12' }).ok).toBe(true)
  })
  it('Prefeito não apresenta Projeto de Resolução', () => {
    const r = aplicar(esp('PR'), regras, novaTramitacao('prefeito'), { tipo: 'protocolar', data: '2026-11-12' })
    expect(r.ok).toBe(false)
  })
  it('cargos da Câmara são de iniciativa da Mesa', () => {
    const r = aplicar(esp('PR'), regras, novaTramitacao('vereador', { materias: ['cargos_camara'] }), { tipo: 'protocolar', data: '2026-11-12' })
    expect(!r.ok && r.erros[0]).toMatch(/privativa de "mesa"/)
  })
})

describe('comissões e prazos', () => {
  const base = () => executar(esp('PLC'), novaTramitacao('prefeito'), [
    { tipo: 'protocolar', data: '2026-11-12' }, { tipo: 'ler', data: '2026-11-12' }, { tipo: 'distribuir', data: '2026-11-12' },
  ])
  it('exige parecer de todas as comissões competentes', () => {
    let t = base()
    expect(t.estado).toBe('em_comissao')
    t = executar(esp('PLC'), t, [{ tipo: 'registrar_parecer', data: '2026-11-16', comissao: 'CCJ', sentido: 'favoravel' }])
    expect(t.estado).toBe('em_comissao')
    t = executar(esp('PLC'), t, [{ tipo: 'registrar_parecer', data: '2026-11-17', comissao: 'CFO', sentido: 'contrario' }])
    expect(t.estado).toBe('pronta_para_pauta')
  })
  it('recusa parecer de comissão não competente e parecer em duplicidade', () => {
    const t = base()
    expect(aplicar(esp('PLC'), regras, t, { tipo: 'registrar_parecer', data: '2026-11-13', comissao: 'CEC', sentido: 'favoravel' }).ok).toBe(false)
    const t2 = executar(esp('PLC'), t, [{ tipo: 'registrar_parecer', data: '2026-11-13', comissao: 'CCJ', sentido: 'favoravel' }])
    expect(aplicar(esp('PLC'), regras, t2, { tipo: 'registrar_parecer', data: '2026-11-13', comissao: 'CCJ', sentido: 'favoravel' }).ok).toBe(false)
  })
  it('só vai à pauta sem parecer depois de vencido o prazo', () => {
    const t = base()
    expect(t.prazoParecer).toBe('2026-12-03')
    expect(aplicar(esp('PLC'), regras, t, { tipo: 'incluir_pauta', data: '2026-12-03' }).ok).toBe(false)
    expect(aplicar(esp('PLC'), regras, t, { tipo: 'incluir_pauta', data: '2026-12-04' }).ok).toBe(true)
    expect(alertasDePrazo(t, '2026-12-04')[0]).toMatch(/CCJ, CFO/)
  })
  it('regime de urgência reduz o prazo', () => {
    const t = executar(esp('PLC'), novaTramitacao('prefeito', { regime: 'urgencia' }), [
      { tipo: 'protocolar', data: '2026-11-12' }, { tipo: 'ler', data: '2026-11-12' }, { tipo: 'distribuir', data: '2026-11-12' },
    ])
    expect(t.prazoParecer).toBe('2026-11-19')
  })
  it('PLC exige maioria absoluta dos membros', () => {
    const t = executar(esp('PLC'), base(), [
      { tipo: 'registrar_parecer', data: '2026-11-13', comissao: 'CCJ', sentido: 'favoravel' },
      { tipo: 'registrar_parecer', data: '2026-11-13', comissao: 'CFO', sentido: 'favoravel' },
      { tipo: 'incluir_pauta', data: '2026-11-16' },
    ])
    const r = aplicar(esp('PLC'), regras, t, { tipo: 'votar', data: '2026-11-16', votos: votos(8, 5, 3) })
    expect(r.ok && r.tramitacao.estado).toBe('rejeitada')
  })
})

describe('Emenda à Lei Orgânica — dois turnos e 2/3', () => {
  const ate1turno = () => executar(esp('PELO'), novaTramitacao('vereador'), [
    { tipo: 'protocolar', data: '2026-11-02' }, { tipo: 'ler', data: '2026-11-02' }, { tipo: 'distribuir', data: '2026-11-02' },
    { tipo: 'registrar_parecer', data: '2026-11-05', comissao: 'CCJ', sentido: 'favoravel' },
    { tipo: 'incluir_pauta', data: '2026-11-09' },
    { tipo: 'votar', data: '2026-11-09', votos: votos(11, 8, 3) },
  ])
  it('aprovada em 1º turno aguarda o 2º, respeitando o interstício de 10 dias', () => {
    const t = ate1turno()
    expect(t.estado).toBe('aguardando_turno')
    expect(t.turnoAtual).toBe(2)
    const cedo = aplicar(esp('PELO'), regras, t, { tipo: 'incluir_pauta', data: '2026-11-18' })
    expect(!cedo.ok && cedo.erros[0]).toMatch(/Interstício/)
    const fim = executar(esp('PELO'), t, [
      { tipo: 'incluir_pauta', data: '2026-11-19' },
      { tipo: 'votar', data: '2026-11-19', votos: votos(11, 8, 3) },
      { tipo: 'aprovar_redacao_final', data: '2026-11-19' },
      { tipo: 'promulgar', data: '2026-11-20' },
      { tipo: 'publicar', data: '2026-11-23' },
    ])
    expect(fim.estado).toBe('publicada')
  })
  it('7 votos não alcançam 2/3 de 11', () => {
    const t = executar(esp('PELO'), ate1turno(), [{ tipo: 'incluir_pauta', data: '2026-11-19' }])
    const r = aplicar(esp('PELO'), regras, t, { tipo: 'votar', data: '2026-11-19', votos: votos(11, 7, 4) })
    expect(r.ok && r.tramitacao.estado).toBe('rejeitada')
  })
  it('não vai à sanção', () => {
    const t: Tramitacao = { ...novaTramitacao('vereador'), estado: 'redacao_final' }
    expect(aplicar(esp('PELO'), regras, t, { tipo: 'enviar_sancao', data: '2026-11-20' }).ok).toBe(false)
  })
})

describe('sanção, veto e sanção tácita', () => {
  const aguardando = (): Tramitacao => ({ ...novaTramitacao('vereador'), estado: 'aguardando_sancao', prazoSancao: '2026-12-03' })
  it('veto rejeitado por maioria absoluta leva à promulgação', () => {
    const t = executar(esp('PLO'), aguardando(), [
      { tipo: 'vetar', data: '2026-12-01' },
      { tipo: 'apreciar_veto', data: '2026-12-10', votos: votos(10, 6, 4) },
      { tipo: 'promulgar', data: '2026-12-11' },
    ])
    expect(t.estado).toBe('promulgada')
  })
  it('veto é mantido quando a rejeição não alcança maioria absoluta', () => {
    const t = executar(esp('PLO'), aguardando(), [
      { tipo: 'vetar', data: '2026-12-01' },
      { tipo: 'apreciar_veto', data: '2026-12-10', votos: votos(10, 5, 5) },
    ])
    expect(t.estado).toBe('arquivada')
  })
  it('veto fora do prazo é recusado e a sanção tácita fica disponível', () => {
    expect(aplicar(esp('PLO'), regras, aguardando(), { tipo: 'vetar', data: '2026-12-04' }).ok).toBe(false)
    expect(aplicar(esp('PLO'), regras, aguardando(), { tipo: 'registrar_sancao_tacita', data: '2026-12-03' }).ok).toBe(false)
    expect(aplicar(esp('PLO'), regras, aguardando(), { tipo: 'registrar_sancao_tacita', data: '2026-12-04' }).ok).toBe(true)
    expect(alertasDePrazo(aguardando(), '2026-12-04')[0]).toMatch(/sanção tácita/)
  })
})

describe('indicação, requerimento e moção', () => {
  it('indicação é lida e encaminhada ao Executivo, sem votação', () => {
    const t = executar(esp('IND'), novaTramitacao('vereador'), [
      { tipo: 'protocolar', data: '2026-11-12' }, { tipo: 'ler', data: '2026-11-12' }, { tipo: 'encaminhar_executivo', data: '2026-11-13' },
    ])
    expect(t.estado).toBe('encaminhada_executivo')
    expect(aplicar(esp('IND'), regras, { ...t, estado: 'lida' }, { tipo: 'distribuir', data: '2026-11-13' }).ok).toBe(false)
  })
  it('requerimento é votado e, aprovado, encaminhado ao Executivo', () => {
    const t = executar(esp('REQ'), novaTramitacao('vereador'), [
      { tipo: 'protocolar', data: '2026-11-12' }, { tipo: 'ler', data: '2026-11-12' }, { tipo: 'incluir_pauta', data: '2026-11-12' },
      { tipo: 'votar', data: '2026-11-12', votos: votos(9, 9, 0) }, { tipo: 'encaminhar_executivo', data: '2026-11-13' },
    ])
    expect(t.estado).toBe('encaminhada_executivo')
  })
  it('moção aprovada não tem redação final', () => {
    const t: Tramitacao = { ...novaTramitacao('vereador'), estado: 'aprovada' }
    expect(aplicar(esp('MOC'), regras, t, { tipo: 'aprovar_redacao_final', data: '2026-11-12' }).ok).toBe(false)
  })
})

describe('ações disponíveis para a interface', () => {
  it('indicação lida: encaminhar ou arquivar, nunca distribuir', () => {
    const a = acoesPossiveis(esp('IND'), { ...novaTramitacao('vereador'), estado: 'lida' })
    expect(a).toContain('encaminhar_executivo')
    expect(a).not.toContain('distribuir')
    expect(a).not.toContain('incluir_pauta')
  })
  it('PLO em redação final: enviar à sanção, não promulgar', () => {
    const a = acoesPossiveis(esp('PLO'), { ...novaTramitacao('vereador'), estado: 'redacao_final' })
    expect(a).toContain('enviar_sancao')
    expect(a).not.toContain('promulgar')
  })
})

describe('numeração e configuração', () => {
  it('numeração anual reinicia no ano novo; contínua não', () => {
    const ex = [{ numero: 44, ano: 2025 }, { numero: 3, ano: 2026 }]
    expect(proximoNumero(esp('PLO'), ex, 2026)).toBe(4)
    expect(proximoNumero({ ...esp('PLO'), numeracao: 'continua' }, ex, 2026)).toBe(45)
  })
  it('modelo padrão é coerente', () => {
    for (const e of especiesPadrao) expect(validarEspecie(e)).toEqual([])
    expect(validarRegras(regras)).toEqual([])
  })
  it('detecta configurações incoerentes', () => {
    expect(validarEspecie({ ...esp('PLO'), geraNorma: false })).not.toEqual([])
    expect(validarEspecie({ ...esp('PELO'), intersticioDias: 0 })).not.toEqual([])
    expect(validarRegras({ ...regras, totalMembros: 8 })).not.toEqual([])
  })
})

describe('entradas malformadas', () => {
  it('rejeita parecer sem comissão ou com sentido inválido', () => {
    const t: Tramitacao = { ...novaTramitacao('vereador'), estado: 'em_comissao', pareceres: { CCJ: null } }
    expect(aplicar(esp('PLO'), regras, t, { tipo: 'registrar_parecer', data: '2026-11-12' } as unknown as Acao).ok).toBe(false)
    expect(aplicar(esp('PLO'), regras, t, { tipo: 'registrar_parecer', data: '2026-11-12', comissao: 'CCJ', sentido: 'talvez' } as unknown as Acao).ok).toBe(false)
  })
  it('rejeita votação sem placar', () => {
    const t: Tramitacao = { ...novaTramitacao('vereador'), estado: 'em_pauta' }
    expect(aplicar(esp('PLO'), regras, t, { tipo: 'votar', data: '2026-11-12' } as unknown as Acao).ok).toBe(false)
  })
  it('validação de configuração não quebra com JSON incompleto', () => {
    expect(validarEspecie({ sigla: 'XX' } as unknown as EspecieConfig).length).toBeGreaterThan(0)
    expect(validarRegras({} as unknown as Parameters<typeof validarRegras>[0]).length).toBeGreaterThan(0)
  })
})
