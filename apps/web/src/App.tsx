import { useEffect, useState } from 'react'
import Presidencia from './pages/Presidencia'
import Gabinete from './pages/Gabinete'
import Radar from './pages/Radar'
import Assistente from './pages/Assistente'
import Processo from './pages/Processo'
import Plenario from './pages/Plenario'
import Cidadao from './pages/Cidadao'
import Mapa from './pages/Mapa'

const telas = [
  { id: 'presidencia', nome: 'Dashboard da Presidência' },
  { id: 'gabinete', nome: 'Gabinete do Vereador' },
  { id: 'radar', nome: 'Radar de Fiscalização' },
  { id: 'ia', nome: 'Assistente Legislativo IA' },
  { id: 'processo', nome: 'Processo Legislativo' },
  { id: 'plenario', nome: 'Plenário Digital' },
  { id: 'cidadao', nome: 'Portal do Cidadão' },
  { id: 'mapa', nome: 'Mapa da Cidade' },
]

const atual = () => window.location.hash.replace('#/', '') || 'presidencia'

export default function App() {
  const [tela, setTela] = useState(atual())
  useEffect(() => {
    const f = () => { setTela(atual()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  const go = (id: string) => { window.location.hash = `#/${id}` }

  return (
    <div className="app">
      <aside className="side">
        <div className="logo">CÂMARA 360º<small>Vale Verde/CE · protótipo</small></div>
        <nav className="nav">
          {telas.map((t, i) => (
            <button key={t.id} className={tela === t.id ? 'on' : ''} onClick={() => go(t.id)}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span>{t.nome}
            </button>
          ))}
        </nav>
        <div className="foot">A Câmara mais inteligente.<br />O vereador mais presente.<br />O cidadão mais ouvido.</div>
      </aside>
      <main className="main">
        {tela === 'presidencia' && <Presidencia />}
        {tela === 'gabinete' && <Gabinete go={go} />}
        {tela === 'radar' && <Radar go={go} />}
        {tela === 'ia' && <Assistente />}
        {tela === 'processo' && <Processo />}
        {tela === 'plenario' && <Plenario />}
        {tela === 'cidadao' && <Cidadao />}
        {tela === 'mapa' && <Mapa go={go} />}
        <p className="disclaimer">Protótipo com dados fictícios. Nenhuma informação se refere a município, pessoa ou contrato real.</p>
      </main>
    </div>
  )
}
