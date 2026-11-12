import type { ReactNode } from 'react'
import type { Nivel } from '../data/mock'
import { nivelLabel } from '../data/mock'

export function Header({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="top">
      <div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      {right}
    </div>
  )
}

export function Kpi({ v, l, d, tone }: { v: string | number; l: string; d?: string; tone?: string }) {
  return (
    <div className="card kpi">
      <div className="l">{l}</div>
      <div className="v">{v}</div>
      {d && <div className={`d tag ${tone ?? 'gray'}`}>{d}</div>}
    </div>
  )
}

const nivelTone: Record<Nivel, string> = { alerta: 'warn', inconsistencia: 'bad', indicio: 'info', conclusao: 'gray' }
export function NivelTag({ n }: { n: Nivel }) {
  return <span className={`tag ${nivelTone[n]}`}>{nivelLabel[n]}</span>
}

export function Steps({ total, cur }: { total: number; cur: number }) {
  return (
    <div className="steps">
      {Array.from({ length: total }, (_, i) => <span key={i} className={i < cur ? 'done' : i === cur ? 'cur' : ''} />)}
    </div>
  )
}
