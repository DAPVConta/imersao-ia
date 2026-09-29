import { useMemo } from 'react'
import { Agenda } from '@/features/agenda/components/agenda'
import { resumirAgenda } from '@/features/agenda/resumo'
import { serieMensal, totaisDoMes } from '@/features/financas/calculos'
import { useFinancas } from '@/features/financas/store'
import { PainelImportacao } from '@/features/importacao/components/painel-importacao'
import { CedulaDoMes } from '@/features/painel/components/cedula-do-mes'
import { ContaECartao } from '@/features/painel/components/conta-e-cartao'
import { LinhaDoAno } from '@/features/painel/components/linha-do-ano'
import { ParaOndeFoi } from '@/features/painel/components/para-onde-foi'
import { TabelaLancamentos } from '@/features/painel/components/tabela-lancamentos'

/** Página principal: o fechamento do mês (layout em docs/design.md). */
export function PaginaPainel() {
  const base = useFinancas((e) => e.base)
  const mesAtual = useFinancas((e) => e.mesAtual)
  const carregando = useFinancas((e) => e.carregando)

  const mes = mesAtual ? base.months[mesAtual] : undefined
  const serie = useMemo(() => serieMensal(base), [base])
  const totais = useMemo(() => totaisDoMes(mes), [mes])
  const previsto = useMemo(() => resumirAgenda(base.agenda, mesAtual, totais.saldo).saldoPrevisto, [base.agenda, mesAtual, totais.saldo])

  if (carregando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[15px] text-ink-mute" role="status">
        Abrindo suas finanças…
      </div>
    )
  }

  return (
    <>
      {mesAtual && mes && <CedulaDoMes chave={mesAtual} totais={totais} serie={serie} saldoPrevisto={previsto} />}
      <div className="mt-8">
        <LinhaDoAno serie={serie} mesAtual={mesAtual} />
      </div>
      {mesAtual && mes && (
        <div className="grid gap-x-14 border-t border-rule pt-8 lg:grid-cols-[1.15fr_1fr]">
          <ParaOndeFoi totais={totais} />
          <ContaECartao mes={mes} />
        </div>
      )}
      <Agenda agenda={base.agenda} mesAtual={mesAtual} saldoDoMes={totais.saldo} />
      {mesAtual && <TabelaLancamentos chave={mesAtual} mes={mes} />}
      <PainelImportacao />
    </>
  )
}
