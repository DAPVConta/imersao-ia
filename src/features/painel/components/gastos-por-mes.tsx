import { Card, CardTitle } from '@/components/ui/card'
import type { PontoMensal } from '@/features/financas/calculos'
import { fmtBRL, fmtCompacto, rotuloMes } from '@/lib/formato'
import { cn } from '@/lib/utils'

const W = 760, H = 230, padX = 30, topo = 38, base = H - 34

/** Barras com o total de despesas de cada mês e uma linha tracejada com a média. */
export function GastosPorMes({ serie, mesAtual }: { serie: PontoMensal[]; mesAtual: string | null }) {
  const temDados = serie.some((d) => d.despesas > 0)
  const max = Math.max(1, ...serie.map((d) => d.despesas))
  const media = serie.reduce((s, d) => s + d.despesas, 0) / (serie.length || 1)
  const faixa = (W - padX * 2) / (serie.length || 1)
  const largura = Math.min(58, faixa * 0.55)
  const alturaDe = (v: number) => Math.max((v / max) * (base - topo), v > 0 ? 3 : 0)
  const yMedia = base - alturaDe(media)

  return (
    <Card>
      <CardTitle dica="só despesas, exclui transferências">Total de gastos por mês</CardTitle>
      {!temDados ? (
        <p className="text-[11.5px] text-ink-mute">Ainda não há despesas lançadas para comparar.</p>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full pt-1" role="img" aria-label="total de gastos por mês">
          <defs>
            <linearGradient id="gm-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--debit))" />
              <stop offset="100%" stopColor="rgb(var(--debit-deep))" />
            </linearGradient>
          </defs>
          <line x1={padX - 6} y1={base} x2={W - padX + 6} y2={base} stroke="rgb(var(--rule-strong))" strokeWidth="1" />
          {serie.length > 1 && (
            <>
              <line x1={padX - 6} y1={yMedia} x2={W - padX + 6} y2={yMedia} stroke="rgb(var(--ink-mute))" strokeWidth="1.5" strokeDasharray="5 5" opacity=".75" />
              <text x={padX - 4} y={yMedia - 7} textAnchor="start" className="svg-media">média {fmtCompacto(media)}</text>
            </>
          )}
          {serie.map((d, i) => {
            const x = padX + faixa * i + faixa / 2
            const h = alturaDe(d.despesas)
            const y = base - h
            const atual = d.chave === mesAtual
            return (
              <g key={d.chave} className="group">
                <rect x={x - largura / 2} y={y} width={largura} height={h} rx="7" fill="url(#gm-grad)"
                  className={cn('transition-opacity group-hover:opacity-100', atual ? 'opacity-100' : 'opacity-55')}>
                  <title>{`${rotuloMes(d.chave)}: ${fmtBRL(d.despesas)}`}</title>
                </rect>
                <text x={x} y={y - 9} textAnchor="middle" className={cn('svg-valor', atual && 'svg-atual')}>{fmtCompacto(d.despesas)}</text>
                <text x={x} y={H - 12} textAnchor="middle" className={cn('svg-mes', atual && 'svg-atual')}>{rotuloMes(d.chave)}</text>
              </g>
            )
          })}
        </svg>
      )}
    </Card>
  )
}
