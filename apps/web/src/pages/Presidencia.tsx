import { Header, Kpi, Steps } from '../components/ui'
import { alertas, demandas, etapas, proposicoes } from '../data/mock'

export default function Presidencia() {
  const atrasadas = proposicoes.filter(p => p.atrasada)
  return (
    <>
      <Header title="Painel da Presidência" sub="Visão geral da Casa · novembro de 2026"
        right={<span className="tag">Sessão ordinária nº 38 — 13/11, 9h</span>} />
      <div className="grid g4">
        <Kpi l="Matérias em tramitação" v={proposicoes.length} d="+4 no mês" tone="info" />
        <Kpi l="Prazos regimentais vencidos" v={atrasadas.length} d="Requer atenção" tone="bad" />
        <Kpi l="Demandas do cidadão abertas" v={demandas.filter(d => d.status < 4).length} d="Tempo médio de resposta: 9 dias" tone="gray" />
        <Kpi l="Alertas de fiscalização" v={alertas.length} d="Para os gabinetes avaliarem" tone="warn" />
      </div>
      <div className="grid g21" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>Matérias em tramitação</h2>
          <table>
            <thead><tr><th>Matéria</th><th>Ementa</th><th>Fase</th><th>Prazo</th></tr></thead>
            <tbody>
              {proposicoes.map(p => (
                <tr key={p.id}>
                  <td><b>{p.especie} {p.numero}</b><div className="small muted">{p.autor}</div></td>
                  <td>{p.ementa}</td>
                  <td style={{ minWidth: 150 }}><div className="small">{etapas[p.etapa]}</div><Steps total={etapas.length} cur={p.etapa} /></td>
                  <td>{p.atrasada ? <span className="tag bad">{p.prazo}</span> : <span className="small">{p.prazo}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid">
          <div className="card">
            <h2>Pendências da Mesa</h2>
            <div className="list">
              <div className="item"><span>PLC 08/2026 — prazo de parecer da CCJ vencido</span><span className="tag bad">Vencido</span></div>
              <div className="item"><span>Ata da sessão nº 37 aguardando assinatura</span><span className="tag warn">Assinar</span></div>
              <div className="item"><span>3 pedidos e-SIC com prazo em 5 dias</span><span className="tag warn">LAI</span></div>
              <div className="item"><span>Contrato de TI da Câmara vence em 45 dias</span><span className="tag gray">Gestão</span></div>
            </div>
          </div>
          <div className="card">
            <h2>Produtividade legislativa (2026)</h2>
            {[['Projetos de lei', 58, 80], ['Indicações', 231, 260], ['Requerimentos', 118, 150], ['Pareceres emitidos', 74, 90]].map(([l, v, m]) => (
              <div key={l as string} style={{ marginBottom: 10 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}><span>{l}</span><b>{v}</b></div>
                <div className="bar"><span style={{ width: `${(Number(v) / Number(m)) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="card">
            <h2>Transparência</h2>
            <div className="list small">
              <div className="item"><span>Votações nominais publicadas</span><span className="tag ok">100%</span></div>
              <div className="item"><span>Atas publicadas em até 10 dias</span><span className="tag ok">94%</span></div>
              <div className="item"><span>Pedidos LAI respondidos no prazo</span><span className="tag warn">88%</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
