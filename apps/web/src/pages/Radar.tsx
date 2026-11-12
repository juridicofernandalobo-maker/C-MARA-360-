import { useState } from 'react'
import { Header, Kpi, NivelTag } from '../components/ui'
import { alertas } from '../data/mock'

const areas = ['Todas', 'Saúde', 'Educação', 'Obras', 'Pessoal', 'Licitações', 'Patrimônio', 'Orçamento', 'Transferências']

export default function Radar({ go }: { go: (p: string) => void }) {
  const [area, setArea] = useState('Todas')
  const [sel, setSel] = useState(alertas[0])
  const lista = alertas.filter(a => area === 'Todas' || a.area === area)
  return (
    <>
      <Header title="Radar de Fiscalização" sub="Controle externo — CF, art. 31 · Fontes: SIM/TCE-CE, Siconfi, PNCP, Portal da Transparência"
        right={<span className="tag gray">Última carga: 05/11/2026 03:10</span>} />
      <div className="grid g4">
        <Kpi l="Contratos analisados" v={42} />
        <Kpi l="Alertas para revisão" v={alertas.length} tone="warn" d="1 inconsistência" />
        <Kpi l="Obras monitoradas" v={12} />
        <Kpi l="Requerimentos pendentes de resposta" v={5} tone="bad" d="2 fora do prazo" />
      </div>
      <div className="row" style={{ margin: '16px 0' }}>
        {areas.map(a => <button key={a} className={`btn ${a === area ? 'primary' : ''}`} onClick={() => setArea(a)}>{a}</button>)}
      </div>
      <div className="grid g12">
        <div className="card">
          <h2>Achados</h2>
          <div className="list">
            {lista.length === 0 && <p className="muted">Nenhum achado nesta área.</p>}
            {lista.map(a => (
              <div key={a.id} className="item" style={{ cursor: 'pointer', flexDirection: 'column', background: sel.id === a.id ? '#f3f8fa' : undefined }} onClick={() => setSel(a)}>
                <div className="row"><NivelTag n={a.nivel} /><span className="tag gray">{a.area}</span></div>
                <b>{a.titulo}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>Dossiê do achado</h2><NivelTag n={sel.nivel} />
          </div>
          <p><b>{sel.titulo}</b><br /><span className="muted">{sel.detalhe}</span></p>
          <h3>Regra aplicada</h3><p>{sel.regra}</p>
          <h3>Cálculo reproduzível</h3>
          <ul>{sel.calculo.map(c => <li key={c}>{c}</li>)}</ul>
          <h3>Fontes e evidências</h3>
          <ul>{sel.fontes.map(f => <li key={f}><a href="#" onClick={e => e.preventDefault()}>{f}</a></li>)}</ul>
          <h3>Perguntas sugeridas</h3>
          <ol>{sel.perguntas.map(p => <li key={p}>{p}</li>)}</ol>
          <p className="note">
            Este é um <b>{sel.nivel === 'inconsistencia' ? 'apontamento de inconsistência entre fontes' : 'alerta automático'}</b>, não uma constatação de irregularidade.
            Conclusões dependem de análise técnica, contraditório e procedimento próprio.
          </p>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn primary" onClick={() => go('ia')}>Minutar requerimento de informações</button>
            <button className="btn">Agendar visita técnica</button>
            <button className="btn">Arquivar com justificativa</button>
          </div>
        </div>
      </div>
    </>
  )
}
