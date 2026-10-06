import { useMemo } from 'react'
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina'
import { Agenda } from '@/features/agenda/components/agenda'
import { totaisDoMes } from '@/features/financas/calculos'
import { useFinancas } from '@/features/financas/store'

/** Contas a pagar e dinheiro a receber que ainda não aconteceram. */
export function PaginaAgenda() {
  const base = useFinancas((e) => e.base)
  const mesAtual = useFinancas((e) => e.mesAtual)
  const totais = useMemo(() => totaisDoMes(mesAtual ? base.months[mesAtual] : undefined), [base.months, mesAtual])
  const n = base.agenda.length
  return (
    <>
      <CabecalhoPagina titulo="Agenda" contexto={n ? `${n} ${n === 1 ? 'item previsto' : 'itens previstos'}, fora dos totais até acontecerem` : 'Nada previsto por enquanto'} />
      <Agenda agenda={base.agenda} mesAtual={mesAtual} saldoDoMes={totais.saldo} />
    </>
  )
}
