import { useState } from 'react'
import { Header } from '../components/ui'
import { etapas, proposicoes } from '../data/mock'

export default function Processo() {
  const [sel, setSel] = useState(proposicoes[1])
  return (
    <>
      <Header title="Processo Legislativo" sub="Tramitação visual com rito parametrizado pela Lei Orgânica e Regimento Interno" />
      <div className="grid g12">
        <div className="card">
          <h2>Proposições</h2>
          <div className="list">
            {proposicoes.map(p => (
              <div key={p.id} className="item" style={{ cursor: 'pointer', flexDirection: 'column', background: sel.id === p.id ? '#f3f8fa' : undefined }} onClick={() => setSel(p)}>
                <div className="row"><b>{p.especie} {p.numero}</b>{p.atrasada && <span className="tag bad">prazo vencido</span>}</div>
                <span className="small muted">{p.ementa}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid">
          <div className="card">
            <h2>{sel.especie} {sel.numero}</h2>
            <p>{sel.ementa}<br /><span className="muted small">Autoria: {sel.autor}</span></p>
            <div className="flow">{etapas.map((e, i) => <div key={e} className={i < sel.etapa ? 'done' : i === sel.etapa ? 'cur' : ''}>{e}</div>)}</div>
          </div>
          <div className="grid g2">
            <div className="card">
              <h2>Regras do rito (parametrizadas)</h2>
              <table className="small"><tbody>
                <tr><td>Quórum de aprovação</td><td><b>{sel.especie === 'PLC' || sel.especie === 'PELO' ? (sel.especie === 'PELO' ? '2/3 dos membros' : 'Maioria absoluta') : 'Maioria simples'}</b></td></tr>
                <tr><td>Turnos</td><td><b>{sel.especie === 'PELO' ? '2, interstício de 10 dias' : '1'}</b></td></tr>
                <tr><td>Comissões</td><td><b>CCJ{sel.especie === 'PLC' ? ', Finanças' : ''}</b></td></tr>
                <tr><td>Prazo de parecer</td><td><b>15 dias úteis</b></td></tr>
                <tr><td>Regime</td><td><b>Ordinário</b></td></tr>
                <tr><td>Fonte</td><td>LOM art. 45; RI arts. 130–152</td></tr>
              </tbody></table>
            </div>
            <div className="card">
              <h2>Análise assistida por IA</h2>
              <div className="list small">
                <div className="item"><span>Competência municipal (CF, art. 30)</span><span className="tag ok">Compatível</span></div>
                <div className="item"><span>Vício de iniciativa</span><span className={`tag ${sel.especie === 'PLO' && sel.id === 'p1' ? 'warn' : 'ok'}`}>{sel.id === 'p1' ? 'Verificar: cria atribuição ao Executivo' : 'Não identificado'}</span></div>
                <div className="item"><span>Técnica legislativa (LC 95/1998)</span><span className="tag warn">Falta cláusula de vigência</span></div>
                <div className="item"><span>Impacto orçamentário (LRF, art. 16)</span><span className="tag gray">Sem despesa estimada</span></div>
              </div>
              <p className="small muted">Apontamentos sujeitos ao parecer da Procuradoria e da Comissão de Justiça.</p>
            </div>
          </div>
          <div className="card">
            <h2>Histórico de movimentações</h2>
            <div className="timeline">
              <div className="ev"><b>03/10/2026</b> — Protocolada eletronicamente, assinatura qualificada.</div>
              <div className="ev"><b>07/10/2026</b> — Lida no Expediente da Sessão nº 33.</div>
              <div className="ev"><b>08/10/2026</b> — Distribuída à CCJ; relator: Ver. Heitor Alves.</div>
              {sel.etapa >= 3 && <div className="ev"><b>28/10/2026</b> — Parecer favorável da CCJ aprovado (4 × 1).</div>}
              {sel.etapa >= 4 && <div className="ev"><b>06/11/2026</b> — Incluída na Ordem do Dia da Sessão nº 38.</div>}
              <div className="ev pend muted">Próxima fase: {etapas[sel.etapa]}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
