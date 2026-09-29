/**
 * Datas de algo que se repete todo mês, a partir da primeira (AAAA-MM-DD).
 * Dia 29, 30 ou 31 em mês mais curto cai no último dia daquele mês
 * (aluguel do dia 31 vence em 28/02, e volta ao dia 31 em março).
 */
export function datasMensais(primeiraIso: string, vezes: number): string[] {
  const [ano, mes, dia] = primeiraIso.split('-').map(Number)
  const datas: string[] = []
  for (let i = 0; i < vezes; i++) {
    const alvo = new Date(Date.UTC(ano, mes - 1 + i, 1))
    const ultimoDia = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate()
    alvo.setUTCDate(Math.min(dia, ultimoDia))
    datas.push(alvo.toISOString().slice(0, 10))
  }
  return datas
}
