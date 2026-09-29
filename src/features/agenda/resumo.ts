import { chaveDoMes, dataIso, diasAte } from '@/lib/datas'
import type { Agendamento } from './tipos'

export type FiltroAgenda = '30' | 'todos' | 'mes'

/** Agenda em ordem de data. */
export function ordenarAgenda(agenda: Agendamento[]): Agendamento[] {
  return agenda.slice().sort((a, b) => (dataIso(a.date) ?? '').localeCompare(dataIso(b.date) ?? ''))
}

/**
 * Números do topo da agenda — sempre sobre TUDO que está previsto, não sobre
 * o filtro da lista. `saldoDoMes` é o resultado já realizado do mês aberto.
 */
export function resumirAgenda(itens: Agendamento[], mesAtual: string | null, saldoDoMes: number, agora = new Date()) {
  let aPagar30 = 0, aReceber30 = 0, atrasados = 0, valorAtrasado = 0, previstoMes = 0
  for (const a of itens) {
    const iso = dataIso(a.date)
    if (!iso) continue
    const dias = diasAte(iso, agora)
    if (dias < 0) {
      atrasados++
      valorAtrasado += a.value
    }
    if (dias <= 30) {
      if (a.type === 'despesa') aPagar30 += a.value
      else if (a.type === 'receita') aReceber30 += a.value
    }
    if (chaveDoMes(iso) === mesAtual) {
      if (a.type === 'despesa') previstoMes -= a.value
      else if (a.type === 'receita') previstoMes += a.value
    }
  }
  return { aPagar30, aReceber30, atrasados, valorAtrasado, saldoPrevisto: saldoDoMes + previstoMes }
}

export function filtrarAgenda(itens: Agendamento[], filtro: FiltroAgenda, mesAtual: string | null, agora = new Date()) {
  return itens.filter((a) => {
    const iso = dataIso(a.date)
    if (!iso) return false
    if (filtro === '30') return diasAte(iso, agora) <= 30
    if (filtro === 'mes') return chaveDoMes(iso) === mesAtual
    return true
  })
}
