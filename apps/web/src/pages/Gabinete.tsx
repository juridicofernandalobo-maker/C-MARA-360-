import { useState } from 'react'
import { Header, Kpi } from '../components/ui'
import { demandas, proposicoes, statusDemanda } from '../data/mock'

export default function Gabinete({ go }: { go: (p: string) => void }) {
  const minhas = demandas.filter(d => !d.gabinete || d.gabinete === 'Ana Ribeiro')
  const [sel, setSel] = useState(minhas[0])
  return (
    <>
      <Header title="Meu Gabinete — Ver.ª Ana Ribeiro" sub="Atividade parlamentar e atendimento institucional"
        right={<button className="btn primary" onClick={() => go('ia')}>+ Nova proposição com IA</button>} />
      <div className="grid g4">
        <Kpi l="Demandas recebidas" v={34} d="6 novas esta semana" tone="info" />
        <Kpi l="Proposições no ano" v={12} />
        <Kpi l="Respostas do Executivo" v={8} d="4 aguardando além do prazo" tone="warn" />
        <Kpi l="Visitas de fiscalização" v={5} />
      </div>
      <div className="grid g2" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>Caixa de demandas</h2>
          <div className="list">
            {minhas.map(d => (
              <div key={d.protocolo} className="item" style={{ cursor: 'pointer', background: sel.protocolo === d.protocolo ? '#f3f8fa' : undefined }} onClick={() => setSel(d)}>
                <div><b>{d.assunto}</b><div className="small muted">{d.bairro} · protocolo {d.protocolo} · {d.data}</div></div>
                <span className={`tag ${d.status >= 3 ? 'ok' : d.status === 0 ? 'warn' : 'gray'}`}>{statusDemanda[d.status]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2>Histórico de providências — {sel.protocolo}</h2>
          <div className="flow">{statusDemanda.map((s, i) => <div key={s} className={i < sel.status ? 'done' : i === sel.status ? 'cur' : ''}>{s}</div>)}</div>
          <div className="timeline" style={{ marginTop: 14 }}>
            <div className="ev"><b>{sel.data}</b> — Demanda registrada pelo cidadão no Portal (foto + localização).</div>
            {sel.status >= 1 && <div className="ev">Triagem automática: assunto “{sel.assunto}”, competência da Secretaria responsável.</div>}
            {sel.status >= 2 && <div className="ev">Indicação nº 231/2026 apresentada e lida em plenário; ofício encaminhado ao Executivo.</div>}
            {sel.status >= 3 && <div className="ev">Resposta do Executivo vinculada: “{sel.resposta}”</div>}
            {sel.status < 4 && <div className="ev pend muted">Aguardando conclusão / verificação in loco.</div>}
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn" onClick={() => go('ia')}>Gerar indicação</button>
            <button className="btn">Agendar visita</button>
            <button className="btn">Responder ao cidadão</button>
          </div>
          <p className="note info" style={{ marginTop: 12 }}>
            Dados pessoais do solicitante são acessíveis apenas para o atendimento institucional e não podem ser exportados para fins partidários ou eleitorais (LGPD e Lei 9.504/1997, art. 73).
          </p>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h2>Minhas proposições</h2>
        <table><tbody>
          {proposicoes.filter(p => p.autor === 'Ana Ribeiro').map(p => (
            <tr key={p.id}><td><b>{p.especie} {p.numero}</b></td><td>{p.ementa}</td><td><button className="btn" onClick={() => go('processo')}>Ver tramitação</button></td></tr>
          ))}
        </tbody></table>
      </div>
    </>
  )
}
