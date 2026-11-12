import { useState } from 'react'
import { Header, Kpi } from '../components/ui'
import { vereadores } from '../data/mock'

type V = 'sim' | 'nao' | 'abs' | 'pend' | 'aus'
const inicial: V[] = ['sim', 'sim', 'nao', 'sim', 'pend', 'sim', 'abs', 'pend', 'sim', 'aus', 'pend']
const rotulo: Record<V, string> = { sim: 'Sim', nao: 'Não', abs: 'Abstenção', pend: 'Aguardando', aus: 'Ausente' }

export default function Plenario() {
  const [votos, setVotos] = useState<V[]>(inicial)
  const [encerrada, setEncerrada] = useState(false)
  const presentes = votos.filter(v => v !== 'aus').length
  const sim = votos.filter(v => v === 'sim').length
  const nao = votos.filter(v => v === 'nao').length
  const pend = votos.filter(v => v === 'pend').length
  const quorum = presentes >= 6

  const simular = () => setVotos(vs => vs.map((v, i) => v === 'pend' ? (i % 2 ? 'sim' : 'nao') : v))
  return (
    <>
      <Header title="Plenário Digital" sub="Sessão Ordinária nº 38 · 13/11/2026 · Ordem do Dia"
        right={<span className="tag bad">● AO VIVO</span>} />
      <div className="grid g4">
        <Kpi l="Presentes" v={`${presentes}/${vereadores.length}`} d={quorum ? 'Quórum atingido' : 'Sem quórum'} tone={quorum ? 'ok' : 'bad'} />
        <Kpi l="Sim" v={sim} tone="ok" />
        <Kpi l="Não" v={nao} tone="bad" />
        <Kpi l="Aguardando voto" v={pend} />
      </div>
      <div className="grid g21" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>Em votação: PLO 47/2026 — Transparência das rotas do transporte escolar</h2>
          <p className="small muted">Votação nominal · Quórum: maioria simples dos presentes · 1º turno</p>
          <div className="vote">
            {vereadores.map((n, i) => (
              <div key={n} className={`seat ${votos[i]}`}><span>{n}</span><b>{rotulo[votos[i]]}</b></div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn" disabled={encerrada || pend === 0} onClick={simular}>Simular votos restantes</button>
            <button className="btn primary" disabled={pend > 0 || encerrada} onClick={() => setEncerrada(true)}>Encerrar votação</button>
          </div>
          {encerrada && <p className={`note ${sim > nao ? 'info' : ''}`} style={{ marginTop: 12 }}>
            Resultado: <b>{sim > nao ? 'APROVADO' : 'REJEITADO'}</b> — {sim} sim, {nao} não, {votos.filter(v => v === 'abs').length} abstenção. Votação nominal publicada automaticamente no Portal.
          </p>}
        </div>
        <div className="grid">
          <div className="card">
            <h2>Pauta</h2>
            <div className="list small">
              <div className="item"><span>1. Leitura da ata nº 37</span><span className="tag ok">Feito</span></div>
              <div className="item"><span>2. Expediente: 14 indicações, 3 requerimentos</span><span className="tag ok">Feito</span></div>
              <div className="item"><span>3. PLO 47/2026</span><span className="tag warn">Em votação</span></div>
              <div className="item"><span>4. PR 12/2026</span><span className="tag gray">Próximo</span></div>
              <div className="item"><span>5. Explicações pessoais</span><span className="tag gray">—</span></div>
            </div>
          </div>
          <div className="card">
            <h2>Oradores inscritos</h2>
            <div className="list small">
              <div className="item"><span>Davi Nogueira (autor)</span><b>05:00</b></div>
              <div className="item"><span>Carla Menezes</span><b>03:00</b></div>
            </div>
          </div>
          <div className="card">
            <h2>Transcrição e ata</h2>
            <p className="small">Transcrição automática em andamento. Minuta de ata gerada ao fim da sessão.</p>
            <p className="note small">A ata só tem validade após revisão, aprovação em plenário e assinatura da Mesa.</p>
          </div>
        </div>
      </div>
    </>
  )
}
