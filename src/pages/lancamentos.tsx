import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina'
import { useFinancas } from '@/features/financas/store'
import { TabelaLancamentos } from '@/features/painel/components/tabela-lancamentos'
import { mesPorExtenso } from '@/lib/formato-mes'

/** O extrato do mês aberto, com busca e filtros. */
export function PaginaLancamentos() {
  const base = useFinancas((e) => e.base)
  const mesAtual = useFinancas((e) => e.mesAtual)
  if (!mesAtual) return null
  const mes = base.months[mesAtual]
  const n = mes?.transactions.length ?? 0
  return (
    <>
      <CabecalhoPagina titulo="Lançamentos" contexto={`${n === 1 ? '1 lançamento' : `${n} lançamentos`} em ${mesPorExtenso(mesAtual)}`} />
      <TabelaLancamentos chave={mesAtual} mes={mes} />
    </>
  )
}
