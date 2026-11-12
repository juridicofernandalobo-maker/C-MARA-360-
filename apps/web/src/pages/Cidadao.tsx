import { useState } from 'react'
import { Header } from '../components/ui'
import { demandas, statusDemanda } from '../data/mock'

export default function Cidadao() {
  const [modo, setModo] = useState<'home' | 'relatar' | 'ok' | 'acompanhar'>('home')
  const [prot, setProt] = useState('2026-001842')
  const [form, setForm] = useState({ assunto: 'Iluminação pública', bairro: 'Centro', desc: '' })
  const achada = demandas.find(d => d.protocolo === prot.trim())

  return (
    <>
      <Header title="Portal do Cidadão" sub="Câmara Municipal de Vale Verde — fale com a sua Câmara"
        right={modo !== 'home' && <button className="btn" onClick={() => setModo('home')}>← Início</button>} />
      {modo === 'home' && (
        <>
          <div className="svc">
            <button onClick={() => setModo('relatar')}><span className="ic">📷</span>Relatar problema</button>
            <button onClick={() => setModo('acompanhar')}><span className="ic">🔎</span>Acompanhar pedido</button>
            <button><span className="ic">🗺️</span>Mapa da cidade</button>
            <button><span className="ic">🗳️</span>Opinar sobre projetos</button>
            <button><span className="ic">📺</span>Assistir à sessão</button>
            <button><span className="ic">💬</span>Falar com a Câmara</button>
          </div>
          <div className="grid g2" style={{ marginTop: 16 }}>
            <div className="card">
              <h2>Em consulta pública</h2>
              <p><b>PLO 47/2026</b> — Transparência das rotas do transporte escolar</p>
              <div className="bar"><span style={{ width: '72%' }} /></div>
              <p className="small muted">72% favoráveis · 318 participações · encerra em 20/11</p>
            </div>
            <div className="card">
              <h2>Últimas votações</h2>
              <div className="list small">
                <div className="item"><span>PR 11/2026 — Semana Municipal do Idoso</span><span className="tag ok">Aprovado 10×0</span></div>
                <div className="item"><span>PLO 41/2026 — Feira da Agricultura Familiar</span><span className="tag ok">Aprovado 8×2</span></div>
              </div>
            </div>
          </div>
        </>
      )}
      {modo === 'relatar' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <h2>Relatar um problema</h2>
          <label>Assunto</label>
          <select value={form.assunto} onChange={e => setForm({ ...form, assunto: e.target.value })}>
            {['Iluminação pública', 'Buraco na via', 'Transporte escolar', 'Saúde', 'Coleta de lixo', 'Outro'].map(a => <option key={a}>{a}</option>)}
          </select>
          <label>Bairro / comunidade</label>
          <select value={form.bairro} onChange={e => setForm({ ...form, bairro: e.target.value })}>
            {['Centro', 'Esperança', 'Alto Alegre', 'Sítio Lagoa'].map(a => <option key={a}>{a}</option>)}
          </select>
          <label>Descrição</label>
          <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Conte o que está acontecendo" />
          <label>Foto e localização</label>
          <div className="row"><button className="btn">📷 Anexar foto</button><button className="btn">📍 Usar minha localização</button></div>
          <p className="small muted" style={{ marginTop: 12 }}>
            Seus dados serão usados apenas para o atendimento desta solicitação (LGPD). Não serão usados para propaganda política.
          </p>
          <button className="btn primary" onClick={() => setModo('ok')}>Enviar</button>
        </div>
      )}
      {modo === 'ok' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <h2>✅ Solicitação registrada</h2>
          <p>Protocolo: <b>2026-001902</b> — {form.assunto}, {form.bairro}</p>
          <p className="note">A Câmara acompanha e encaminha sua solicitação ao Poder Executivo. A execução do serviço depende do órgão municipal competente.</p>
          <button className="btn" style={{ marginTop: 12 }} onClick={() => setModo('acompanhar')}>Acompanhar pedidos</button>
        </div>
      )}
      {modo === 'acompanhar' && (
        <div className="card" style={{ maxWidth: 720 }}>
          <h2>Acompanhar pedido</h2>
          <label>Número do protocolo</label>
          <input value={prot} onChange={e => setProt(e.target.value)} />
          {achada ? (
            <div style={{ marginTop: 16 }}>
              <p><b>{achada.assunto}</b> — {achada.bairro} · registrado em {achada.data}</p>
              <div className="flow">{statusDemanda.map((s, i) => <div key={s} className={i < achada.status ? 'done' : i === achada.status ? 'cur' : ''}>{s}</div>)}</div>
              {achada.resposta && <p className="note info" style={{ marginTop: 10 }}>Resposta do Executivo: {achada.resposta}</p>}
            </div>
          ) : <p className="muted" style={{ marginTop: 12 }}>Protocolo não encontrado. Experimente 2026-001842.</p>}
        </div>
      )}
    </>
  )
}
