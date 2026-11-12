import { useState } from 'react'
import { Header } from '../components/ui'
import { demandas, obras, statusDemanda } from '../data/mock'

const cor = (s: number) => (s >= 3 ? '#1e7d4f' : s === 0 ? '#b3261e' : '#a15c00')

export default function Mapa({ go }: { go: (p: string) => void }) {
  const [info, setInfo] = useState<string>('Clique em um marcador para ver detalhes.')
  const recorrentes = Object.entries(
    demandas.reduce<Record<string, number>>((acc, d) => { const k = `${d.assunto} · ${d.bairro}`; acc[k] = (acc[k] ?? 0) + 1; return acc }, {}),
  ).filter(([, n]) => n > 1)

  return (
    <>
      <Header title="Mapa da Cidade" sub="Demandas, obras e providências por território" />
      <div className="grid g21">
        <div className="card">
          <div className="legend" style={{ marginBottom: 10 }}>
            <span><i style={{ background: '#b3261e' }} />Recebida</span>
            <span><i style={{ background: '#a15c00' }} />Em andamento</span>
            <span><i style={{ background: '#1e7d4f' }} />Respondida/concluída</span>
            <span><i style={{ background: '#3b4fa8', borderRadius: 2 }} />Obra pública</span>
          </div>
          <div className="map">
            <span className="bairro" style={{ left: '10%', top: '8%' }}>Sítio Lagoa</span>
            <span className="bairro" style={{ left: '44%', top: '30%' }}>Centro</span>
            <span className="bairro" style={{ left: '72%', top: '14%' }}>Alto Alegre</span>
            <span className="bairro" style={{ left: '62%', top: '82%' }}>Esperança</span>
            {demandas.map(d => (
              <button key={d.protocolo} className="pin" style={{ left: `${d.x}%`, top: `${d.y}%` }}
                title={d.assunto} onClick={() => setInfo(`${d.assunto} — ${d.bairro} · protocolo ${d.protocolo} · ${statusDemanda[d.status]}`)}>
                <i style={{ background: cor(d.status) }} />
              </button>
            ))}
            {obras.map(o => (
              <button key={o.nome} className="pin obra" style={{ left: `${o.x}%`, top: `${o.y}%` }}
                title={o.nome} onClick={() => setInfo(`Obra: ${o.nome} — ${o.situacao}`)}>
                <i style={{ background: '#3b4fa8' }} />
              </button>
            ))}
          </div>
          <p className="small" style={{ marginTop: 10 }}>{info}</p>
        </div>
        <div className="grid">
          <div className="card">
            <h2>Recorrências detectadas pela IA</h2>
            {recorrentes.map(([k, n]) => (
              <div key={k} className="item"><span>{k}</span><span className="tag warn">{n} relatos</span></div>
            ))}
            <p className="small muted">Agrupamento por assunto, local e período.</p>
          </div>
          <div className="card">
            <h2>Cruzamento com dados públicos</h2>
            <p className="small"><b>Transporte escolar · Sítio Lagoa</b>: 3 relatos de ausência da rota em outubro.</p>
            <ul className="small">
              <li>Contrato 018/2026 — transporte escolar, rota 7 (Sítio Lagoa)</li>
              <li>Pagamento integral de outubro registrado no SIM/TCE-CE</li>
            </ul>
            <p className="note small">Possível divergência entre o serviço relatado e o pagamento. Requer verificação.</p>
            <button className="btn primary" style={{ marginTop: 10 }} onClick={() => go('radar')}>Abrir no Radar de Fiscalização</button>
          </div>
          <div className="card">
            <h2>Critérios de prioridade</h2>
            <p className="small muted">Gravidade · urgência · impacto coletivo · competência · evidências. Nunca critérios político-eleitorais.</p>
          </div>
        </div>
      </div>
    </>
  )
}
