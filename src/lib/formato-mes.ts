const NOMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

/** '2026-07' → 'julho de 2026' */
export function mesPorExtenso(chave: string): string {
  const [ano, mes] = chave.split('-')
  return `${NOMES[parseInt(mes, 10) - 1]} de ${ano}`
}

/** '2026-07' → 'julho' */
export function nomeDoMes(chave: string): string {
  return NOMES[parseInt(chave.split('-')[1], 10) - 1]
}
