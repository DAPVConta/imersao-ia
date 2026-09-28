/** Formatação em português do Brasil: dinheiro, meses e datas. */

const NOMES_MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const LETRAS_MES = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

export function fmtBRL(v: number | null | undefined): string {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Valor curto para caber como rótulo em gráfico: "R$ 4,3 mil". */
export function fmtCompacto(v: number): string {
  const n = Number(v || 0)
  if (n >= 1000) return 'R$ ' + (n / 1000).toFixed(1).replace('.', ',') + ' mil'
  return 'R$ ' + n.toFixed(0)
}

/** '2026-07' → 'jul/2026' */
export function rotuloMes(chave: string): string {
  const [ano, mes] = chave.split('-')
  return NOMES_MES[parseInt(mes, 10) - 1] + '/' + ano
}

/** '2026-07' → 'J' (eixo dos gráficos pequenos) */
export function letraMes(chave: string): string {
  return LETRAS_MES[parseInt(chave.split('-')[1], 10) - 1]
}

/** '2026-11-05' → 'nov' */
export function mesAbreviado(iso: string): string {
  return NOMES_MES[parseInt(iso.slice(5, 7), 10) - 1]
}
