import { useState } from 'react'
import { Header } from '../components/ui'

const tipos = {
  indicacao: 'Indicação',
  requerimento: 'Requerimento de informações',
  oficio: 'Ofício',
} as const
type Tipo = keyof typeof tipos

function minuta(tipo: Tipo, texto: string) {
  const fato = texto.trim() || 'pagamentos do Contrato nº 032/2025 (pavimentação) superiores às medições publicadas'
  if (tipo === 'indicacao') return `INDICAÇÃO Nº ___/2026

Autora: Vereadora Ana Ribeiro

A Vereadora que esta subscreve, com fundamento no Regimento Interno desta Casa, INDICA ao Excelentíssimo Senhor Prefeito Municipal, por intermédio da Secretaria competente, a adoção de providências quanto ao seguinte: ${fato}.

JUSTIFICATIVA
A medida atende a demanda registrada por munícipes no Portal do Cidadão (protocolo 2026-001842) e visa assegurar a adequada prestação do serviço público.

Sala das Sessões, em ___ de novembro de 2026.

______________________________
Vereadora Ana Ribeiro`
  if (tipo === 'oficio') return `OFÍCIO Nº ___/2026 – GAB/AR

Vale Verde/CE, ___ de novembro de 2026.

A Sua Excelência o Senhor
Secretário Municipal de Infraestrutura

Assunto: ${fato}

Senhor Secretário,

Cumprimentando-o, solicito informações e providências relativas ao assunto em epígrafe, no prazo de 30 (trinta) dias.

Respeitosamente,

Vereadora Ana Ribeiro`
  return `REQUERIMENTO Nº ___/2026

Autora: Vereadora Ana Ribeiro

Senhor Presidente,

A Vereadora que este subscreve, no exercício da função fiscalizadora atribuída à Câmara Municipal pelo art. 31 da Constituição Federal e nos termos da Lei Orgânica do Município e do Regimento Interno, REQUER, após deliberação do Plenário, seja encaminhado ao Excelentíssimo Senhor Prefeito Municipal pedido de informações acerca de: ${fato}, especificamente:

I – cópia das medições realizadas e respectivos boletins;
II – relação de empenhos, liquidações e pagamentos efetuados;
III – existência de adiantamento contratual e sua previsão no instrumento;
IV – relatório do fiscal do contrato sobre o percentual físico executado.

JUSTIFICATIVA
Dados públicos extraídos do SIM/TCE-CE e do Portal da Transparência indicam divergência entre valores pagos e medições publicadas, o que demanda esclarecimento, sem qualquer juízo prévio de irregularidade.

Sala das Sessões, em ___ de novembro de 2026.

______________________________
Vereadora Ana Ribeiro`
}

export default function Assistente() {
  const [tipo, setTipo] = useState<Tipo>('requerimento')
  const [texto, setTexto] = useState('')
  const [doc, setDoc] = useState('')
  const [revisado, setRevisado] = useState(false)
  const [assinado, setAssinado] = useState(false)

  const gerar = () => { setDoc(minuta(tipo, texto)); setRevisado(false); setAssinado(false) }

  return (
    <>
      <Header title="Assistente Legislativo IA" sub="Descreva o problema em linguagem natural. A IA prepara a minuta; você revisa e assina." />
      <div className="grid g12">
        <div className="card">
          <h2>Pedido</h2>
          <label>Tipo de documento</label>
          <select value={tipo} onChange={e => setTipo(e.target.value as Tipo)}>
            {Object.entries(tipos).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <label>Descreva o assunto</label>
          <textarea value={texto} onChange={e => setTexto(e.target.value)}
            placeholder="Ex.: pagamentos do contrato de pavimentação 032/2025 maiores que as medições publicadas" />
          <button className="btn primary" style={{ marginTop: 10, width: '100%' }} onClick={gerar}>Gerar minuta</button>
          <h3>Verificações automáticas</h3>
          <div className="list small">
            <div className="item"><span>Competência municipal</span><span className="tag ok">OK</span></div>
            <div className="item"><span>Iniciativa (não reservada ao Executivo)</span><span className="tag ok">OK</span></div>
            <div className="item"><span>Espécie prevista no Regimento</span><span className="tag ok">Art. 112, RI</span></div>
            <div className="item"><span>Linguagem imputativa</span><span className="tag ok">Ausente</span></div>
          </div>
          <h3>Fontes consultadas</h3>
          <ul className="small">
            <li>Lei Orgânica de Vale Verde, art. 31 (fiscalização)</li>
            <li>Regimento Interno, arts. 110–115 (requerimentos)</li>
            <li>Radar de Fiscalização — achado A1</li>
          </ul>
        </div>
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>Minuta — {tipos[tipo]}</h2>
            {doc && <span className={`tag ${assinado ? 'ok' : revisado ? 'info' : 'warn'}`}>{assinado ? 'Assinado e protocolado' : revisado ? 'Revisado' : 'Gerado por IA — revisão pendente'}</span>}
          </div>
          {!doc ? <p className="muted" style={{ marginTop: 16 }}>A minuta aparecerá aqui.</p> : (
            <>
              <textarea className="doc" style={{ minHeight: 420, marginTop: 12 }} value={doc}
                onChange={e => { setDoc(e.target.value); setRevisado(false) }} disabled={assinado} />
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn" disabled={assinado} onClick={() => setRevisado(true)}>Marcar como revisado</button>
                <button className="btn primary" disabled={!revisado || assinado} onClick={() => setAssinado(true)}>Assinar e protocolar</button>
              </div>
              {assinado && <p className="note info" style={{ marginTop: 10 }}>Protocolo REQ 119/2026 gerado. Assinatura eletrônica qualificada registrada (Lei 14.063/2020). Trilha de auditoria: minuta IA → revisão humana → assinatura.</p>}
              <p className="small muted" style={{ marginTop: 10 }}>A IA não substitui a análise jurídica da Procuradoria/Assessoria. O documento só produz efeitos após assinatura da autoridade competente.</p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
