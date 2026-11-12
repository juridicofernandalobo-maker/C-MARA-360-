/** Utilitários de datas em formato ISO (AAAA-MM-DD), sem fuso horário. */

const MS_DIA = 86_400_000

function parse(iso: string): Date {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d))
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function ehDiaUtil(iso: string, feriados: string[]): boolean {
  const dia = parse(iso).getUTCDay()
  return dia !== 0 && dia !== 6 && !feriados.includes(iso.slice(0, 10))
}

/** Soma dias úteis, excluindo o dia de início (regra usual de contagem de prazos). */
export function somarDiasUteis(iso: string, dias: number, feriados: string[]): string {
  let d = parse(iso)
  let restantes = dias
  while (restantes > 0) {
    d = new Date(d.getTime() + MS_DIA)
    if (ehDiaUtil(fmt(d), feriados)) restantes--
  }
  return fmt(d)
}

export function diasCorridos(de: string, ate: string): number {
  return Math.round((parse(ate).getTime() - parse(de).getTime()) / MS_DIA)
}

export function depois(a: string, b: string): boolean {
  return parse(a).getTime() > parse(b).getTime()
}
