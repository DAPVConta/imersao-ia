/**
 * Datas. O app guarda datas de lançamento como 'DD/MM/AAAA' (formato herdado
 * do localStorage da versão anterior); o banco usa 'AAAA-MM-DD'.
 */

/** Hoje no fuso do navegador, em AAAA-MM-DD — mesmo formato do <input type=date>. */
export function hojeIso(agora = new Date()): string {
  return (
    agora.getFullYear() +
    '-' + String(agora.getMonth() + 1).padStart(2, '0') +
    '-' + String(agora.getDate()).padStart(2, '0')
  )
}

export function ehDataFutura(iso: string, agora = new Date()): boolean {
  return !!iso && iso > hojeIso(agora)
}

/** Dias inteiros entre hoje e a data (negativo = já passou). */
export function diasAte(iso: string, agora = new Date()): number {
  if (!iso) return 0
  const [y, m, d] = iso.split('-').map(Number)
  return Math.round(
    (Date.UTC(y, m - 1, d) - Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate())) / 86400000,
  )
}

/** '2026-11-05' → '2026-11' */
export function chaveDoMes(iso: string | null): string | null {
  return iso ? iso.slice(0, 7) : null
}

/** '01/07/2026' → '2026-07-01' (ou null se não for uma data nesse formato) */
export function dataIso(br: string | null | undefined): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(br || '').trim())
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null
}

/** '2026-07-01' → '01/07/2026' */
export function dataBr(iso: string | null | undefined): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** '01/07/2026' → '2026-07' */
export function chaveDoMesBr(br: string | null | undefined): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(br || '').trim())
  return m ? `${m[3]}-${m[2]}` : null
}

export type Prazo = { texto: string; tom: 'venceu' | 'perto' | 'normal' }

export function textoPrazo(dias: number): Prazo {
  if (dias < -1) return { texto: `passou há ${Math.abs(dias)} dias`, tom: 'venceu' }
  if (dias === -1) return { texto: 'era ontem', tom: 'venceu' }
  if (dias === 0) return { texto: 'é hoje', tom: 'perto' }
  if (dias === 1) return { texto: 'é amanhã', tom: 'perto' }
  if (dias <= 7) return { texto: `em ${dias} dias`, tom: 'perto' }
  return { texto: `em ${dias} dias`, tom: 'normal' }
}
