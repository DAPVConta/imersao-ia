import { useMemo } from 'react'
import { Agenda } from '@/features/agenda/components/agenda'
import { serieMensal, totaisDoMes } from '@/features/financas/calculos'
import { useFinancas } from '@/features/financas/store'
import { PainelImportacao } from '@/features/importacao/components/painel-importacao'
import { CartoesResumo } from '@/features/painel/components/cartoes-resumo'
import { DespesasPorCategoria } from '@/features/painel/components/despesas-por-categoria'
import { EvolucaoMensal } from '@/features/painel/components/evolucao-mensal'
import { GastosPorMes } from '@/features/painel/components/gastos-por-mes'
import { Indicadores } from '@/features/painel/components/indicadores'
import { ResumoFatura } from '@/features/painel/components/resumo-fatura'
import { TabelaLancamentos } from '@/features/painel/components/tabela-lancamentos'

/** Página principal: o painel mensal. */
export function PaginaPainel() {
  const base = useFinancas((e) => e.base)
  const mesAtual = useFinancas((e) => e.mesAtual)
  const carregando = useFinancas((e) => e.carregando)

  const mes = mesAtual ? base.months[mesAtual] : undefined
  const serie = useMemo(() => serieMensal(base), [base])
  const totais = useMemo(() => totaisDoMes(mes), [mes])

  if (carregando) {
    return <div className="py-24 text-center text-sm font-semibold text-on-navy-2">Carregando seus dados…</div>
  }

  return (
    <>
      {mesAtual && mes && (
        <>
          <Indicadores key={mesAtual} totais={totais} serie={serie} mesAtual={mesAtual} />
          <CartoesResumo mes={mes} />
          <div className="grid grid-cols-1 gap-5 min-[861px]:grid-cols-[1.1fr_.9fr]">
            <DespesasPorCategoria totais={totais} />
            <ResumoFatura cartao={mes.card} />
          </div>
        </>
      )}
      <EvolucaoMensal serie={serie} mesAtual={mesAtual} />
      <GastosPorMes serie={serie} mesAtual={mesAtual} />
      <PainelImportacao />
      <Agenda agenda={base.agenda} mesAtual={mesAtual} saldoDoMes={totais.saldo} />
      {mesAtual && <TabelaLancamentos chave={mesAtual} mes={mes} />}
    </>
  )
}
