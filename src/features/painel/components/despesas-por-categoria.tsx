import { Card, CardTitle } from '@/components/ui/card'
import { corDaCategoria } from '@/features/financas/categorias'
import type { Totais } from '@/features/financas/tipos'
import { fmtBRL } from '@/lib/formato'

function Rosca({ fatias, total }: { fatias: [string, number][]; total: number }) {
  const cx = 60, cy = 60, r = 44, C = 2 * Math.PI * r
  let acumulado = 0
  const totalTxt = total >= 1000 ? 'R$ ' + (total / 1000).toFixed(1).replace('.', ',') + ' mil' : fmtBRL(total)
  return (
    <svg viewBox="0 0 120 120" className="size-[200px] flex-none" role="img" aria-label="despesas por categoria">
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        <g className="origin-center animate-sweep">
          {fatias.map(([cat, val]) => {
            const frac = total > 0 ? val / total : 0
            const len = Math.max(frac * C - 1.5, 0.5)
            const desloc = -acumulado * C
            acumulado += frac
            return (
              <circle
                key={cat} cx={cx} cy={cy} r={r} fill="none" stroke={corDaCategoria(cat)} strokeWidth="19"
                strokeDasharray={`${len.toFixed(2)} ${(C - len).toFixed(2)}`} strokeDashoffset={desloc.toFixed(2)}
                className="cursor-pointer transition-[stroke-width,filter] duration-200 hover:[filter:brightness(1.1)_saturate(1.15)] hover:[stroke-width:23]"
              >
                <title>{`${cat}: ${fmtBRL(val)} (${(frac * 100).toFixed(1)}%)`}</title>
              </circle>
            )
          })}
        </g>
      </g>
      <text x={cx} y={cy - 3} textAnchor="middle" className="fill-ink text-[12.5px] font-extrabold tracking-[-.02em]">{totalTxt}</text>
      <text x={cx} y={cy + 11} textAnchor="middle" className="fill-ink-mute text-[8px] font-extrabold uppercase tracking-[.14em]">despesas</text>
    </svg>
  )
}

export function DespesasPorCategoria({ totais }: { totais: Totais }) {
  const fatias = Object.entries(totais.porCategoria).sort((a, b) => b[1] - a[1])
  return (
    <Card>
      <CardTitle dica="conta + cartão, exclui transferências">Despesas por categoria</CardTitle>
      {!fatias.length ? (
        <p className="text-[11.5px] text-ink-mute">Sem despesas lançadas neste mês ainda.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-[26px]">
          <Rosca fatias={fatias} total={totais.despesas} />
          <div className="min-w-[240px] flex-1">
            {fatias.map(([cat, val]) => (
              <div key={cat} className="flex items-center gap-[11px] rounded-[9px] px-2 py-[7px] transition-colors hover:stripe">
                <span className="size-[11px] flex-none rounded-[4px] shadow-[0_1px_3px_rgba(0,0,0,.22)]" style={{ background: corDaCategoria(cat) }} />
                <span className="flex-1 truncate text-[12.5px] font-semibold text-ink-2" title={cat}>{cat}</span>
                <span className="num text-right text-[12.5px] font-bold">{fmtBRL(val)}</span>
                <span className="num w-[46px] text-right text-[11px] font-semibold text-ink-mute">
                  {(totais.despesas > 0 ? (val / totais.despesas) * 100 : 0).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
