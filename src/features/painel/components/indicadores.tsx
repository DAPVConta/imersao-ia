import { ArrowDownLeft, ArrowUpRight, CalendarClock, ChevronRight, PiggyBank, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { PontoMensal } from '@/features/financas/calculos'
import type { Totais } from '@/features/financas/tipos'
import { fmtBRL } from '@/lib/formato'
import { cn } from '@/lib/utils'

type Tom = 'credit' | 'debit' | 'accent' | 'previsto'
const TOM: Record<Tom, { icone: string; valor: string; linha: string }> = {
  credit: { icone: 'bg-credit/12 text-credit-deep', valor: 'text-credit-deep', linha: 'rgb(var(--credit))' },
  debit: { icone: 'bg-debit/12 text-debit-deep', valor: 'text-debit-deep', linha: 'rgb(var(--debit))' },
  accent: { icone: 'bg-accent/12 text-accent', valor: 'text-ink', linha: 'rgb(var(--accent))' },
  previsto: { icone: 'bg-previsto/12 text-previsto', valor: 'text-ink', linha: 'rgb(var(--previsto))' },
}

/** Últimos meses em uma linha de tendência, sem eixos. */
function Tendencia({ valores, cor }: { valores: number[]; cor: string }) {
  if (valores.length < 2) return null
  const W = 72, H = 26
  const max = Math.max(...valores, 1), min = Math.min(...valores, 0)
  const pts = valores.map((v, i) => {
    const x = (i / (valores.length - 1)) * W
    const y = H - 2 - ((v - min) / (max - min || 1)) * (H - 4)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="shrink-0">
      <polyline points={pts.join(' ')} fill="none" stroke={cor} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" opacity=".9" />
      <circle cx={W} cy={pts[pts.length - 1].split(',')[1]} r="2.4" fill={cor} />
    </svg>
  )
}

function Indicador({
  rotulo, valor, detalhe, tom, icone: Icone, tendencia, para, variacao,
}: { rotulo: string; valor: string; detalhe: ReactNode; tom: Tom; icone: LucideIcon; tendencia?: number[]; para: string; variacao?: number | null }) {
  const t = TOM[tom]
  return (
    <Link to={para} className="group flex items-start gap-3.5 rounded-lg border border-rule bg-sheet p-4 shadow-nota transition-colors hover:border-rule-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-5">
      <span className={cn('grid size-11 shrink-0 place-content-center rounded-md', t.icone)}>
        <Icone className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2 text-[13px] text-ink-mute">
          {rotulo}
          <ChevronRight className="size-4 shrink-0 text-ink-mute/60 transition-transform group-hover:translate-x-0.5" />
        </span>
        <span className="mt-0.5 flex items-end justify-between gap-2">
          <span className={cn('num text-[21px] font-semibold leading-tight tracking-[-.01em]', t.valor)}>{valor}</span>
          {tendencia && <Tendencia valores={tendencia} cor={t.linha} />}
        </span>
        <span className="mt-1 block text-[12.5px] text-ink-mute">
          {variacao != null && isFinite(variacao) && Math.abs(variacao) >= 0.5 && (
            <span className={cn('num mr-1.5 font-semibold', variacao > 0 ? 'text-credit-deep' : 'text-debit-deep')}>
              {variacao > 0 ? '▲' : '▼'} {Math.abs(variacao).toFixed(0)}%
            </span>
          )}
          {detalhe}
        </span>
      </span>
    </Link>
  )
}

const variacaoPct = (atual: number, anterior: number | undefined) =>
  anterior == null || anterior === 0 ? null : ((atual - anterior) / anterior) * 100

/** Os quatro números do mês, com a tendência dos últimos meses e o passo anterior. */
export function Indicadores({
  chave, totais, serie, aPagar30, atrasados,
}: { chave: string; totais: Totais; serie: PontoMensal[]; aPagar30: number; atrasados: number }) {
  const idx = serie.findIndex((s) => s.chave === chave)
  const janela = serie.slice(Math.max(0, idx - 5), idx + 1)
  const anterior = idx > 0 ? serie[idx - 1] : undefined
  const guardado = totais.receitas > 0 ? Math.max(0, (totais.saldo / totais.receitas) * 100) : 0
  const guardadoAnt = anterior && anterior.receitas > 0 ? Math.max(0, (anterior.saldo / anterior.receitas) * 100) : undefined

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Indicador
        rotulo="Entrou" valor={fmtBRL(totais.receitas)} tom="credit" icone={ArrowDownLeft} para="/lancamentos"
        tendencia={janela.map((s) => s.receitas)} variacao={variacaoPct(totais.receitas, anterior?.receitas)}
        detalhe={anterior ? 'em relação ao mês anterior' : 'receitas do mês'}
      />
      <Indicador
        rotulo="Saiu" valor={fmtBRL(totais.despesas)} tom="debit" icone={ArrowUpRight} para="/lancamentos"
        tendencia={janela.map((s) => s.despesas)} variacao={variacaoPct(totais.despesas, anterior?.despesas)}
        detalhe={anterior ? 'em relação ao mês anterior' : 'despesas do mês'}
      />
      <Indicador
        rotulo="Guardado" valor={`${guardado.toFixed(0)}%`} tom="accent" icone={PiggyBank} para="/lancamentos"
        tendencia={janela.map((s) => (s.receitas > 0 ? Math.max(0, (s.saldo / s.receitas) * 100) : 0))}
        variacao={guardadoAnt == null ? null : guardado - guardadoAnt}
        detalhe={totais.receitas > 0 ? `${fmtBRL(Math.max(0, totais.saldo))} do que entrou` : 'sem receita no mês'}
      />
      <Indicador
        rotulo="A pagar em 30 dias" valor={fmtBRL(aPagar30)} tom="previsto" icone={CalendarClock} para="/agenda"
        detalhe={atrasados ? <span className="font-semibold text-debit-deep">{atrasados} {atrasados === 1 ? 'conta passou' : 'contas passaram'} da data</span> : 'nada atrasado na agenda'}
      />
    </div>
  )
}
