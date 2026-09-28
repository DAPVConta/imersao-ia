import { chaveDoMesBr } from '@/lib/datas'
import type { BaseLocal, LancamentoNovo, Mes, Totais } from './tipos'

export function mesVazio(): Mes {
  return {
    bank: { saldoAnterior: null, saldoFinal: null },
    card: {
      vencimento: '', fechamento: '', saldoAnterior: null, pagamento: null,
      comprasPeriodo: null, total: null, limiteTotal: null, pagamentoMinimo: null,
    },
    transactions: [],
  }
}

/** Receitas, despesas e saldo do mês. Transferências não entram em nenhum. */
export function totaisDoMes(mes: Mes | undefined): Totais {
  const totais: Totais = { receitas: 0, despesas: 0, saldo: 0, porCategoria: {} }
  if (!mes) return totais
  for (const t of mes.transactions) {
    if (t.type === 'receita') totais.receitas += t.value
    else if (t.type === 'despesa') {
      totais.despesas += t.value
      totais.porCategoria[t.category] = (totais.porCategoria[t.category] || 0) + t.value
    }
  }
  totais.saldo = totais.receitas - totais.despesas
  return totais
}

export type PontoMensal = Totais & { chave: string }

/** Totais de todos os meses, em ordem cronológica. */
export function serieMensal(base: BaseLocal): PontoMensal[] {
  return Object.keys(base.months)
    .sort()
    .map((chave) => ({ chave, ...totaisDoMes(base.months[chave]) }))
}

/** Mês predominante nas datas dos lançamentos; empate fica com o mais antigo. */
export function detectarMes(linhas: Pick<LancamentoNovo, 'date'>[]): string | null {
  const contagem: Record<string, number> = {}
  for (const l of linhas) {
    const k = chaveDoMesBr(l.date)
    if (k) contagem[k] = (contagem[k] || 0) + 1
  }
  const chaves = Object.keys(contagem)
  if (!chaves.length) return null
  return chaves.sort((a, b) => contagem[b] - contagem[a] || (a < b ? -1 : 1))[0]
}

export function novoId(prefixo: 'tx' | 'ag' = 'tx'): string {
  return prefixo + '_' + Math.random().toString(36).slice(2, 10)
}
