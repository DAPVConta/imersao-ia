import { useMemo } from 'react'
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina'
import { resumirAgenda } from '@/features/agenda/resumo'
import { serieMensal, totaisDoMes } from '@/features/financas/calculos'
import { useFinancas } from '@/features/financas/store'
import { ContaECartao } from '@/features/painel/components/conta-e-cartao'
import { Indicadores } from '@/features/painel/components/indicadores'
import { LinhaDoAno } from '@/features/painel/components/linha-do-ano'
import { ParaOndeFoi } from '@/features/painel/components/para-onde-foi'
import { ResultadoDoMes } from '@/features/painel/components/resultado-do-mes'
import { mesPorExtenso } from '@/lib/formato-mes'

/** Página principal: o fechamento do mês em um olhar (layout em docs/design.md). */
export function PaginaPainel() {
  const base = useFinancas((e) => e.base)
  const mesAtual = useFinancas((e) => e.mesAtual)
  const carregando = useFinancas((e) => e.carregando)

  const mes = mesAtual ? base.months[mesAtual] : undefined
  const serie = useMemo(() => serieMensal(base), [base])
  const totais = useMemo(() => totaisDoMes(mes), [mes])
  const agenda = useMemo(() => resumirAgenda(base.agenda, mesAtual, totais.saldo), [base.agenda, mesAtual, totais.saldo])

  if (carregando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[15px] text-ink-mute" role="status">
        Abrindo suas finanças…
      </div>
    )
  }
  if (!mesAtual || !mes) return null

  const n = mes.transactions.length
  return (
    <>
      <CabecalhoPagina titulo="Painel" contexto={`${n === 1 ? '1 lançamento' : `${n} lançamentos`} em ${mesPorExtenso(mesAtual)}`} />
      <div className="grid gap-5">
        <ResultadoDoMes chave={mesAtual} totais={totais} serie={serie} saldoPrevisto={agenda.saldoPrevisto} />
        <Indicadores chave={mesAtual} totais={totais} serie={serie} aPagar30={agenda.aPagar30} atrasados={agenda.atrasados} />
        <LinhaDoAno serie={serie} mesAtual={mesAtual} />
        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <ParaOndeFoi totais={totais} />
          <ContaECartao mes={mes} />
        </div>
      </div>
    </>
  )
}
