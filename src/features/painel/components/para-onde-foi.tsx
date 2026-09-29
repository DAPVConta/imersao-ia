import { Card, CardTitle } from '@/components/ui/card'
import { corDaCategoria } from '@/features/financas/categorias'
import type { Totais } from '@/features/financas/tipos'
import { fmtBRL } from '@/lib/formato'

/** Despesas por categoria, da maior para a menor, como uma lista com barras. */
export function ParaOndeFoi({ totais }: { totais: Totais }) {
  const linhas = Object.entries(totais.porCategoria).sort((a, b) => b[1] - a[1])
  const maior = linhas[0]?.[1] ?? 1
  return (
    <Card className="border-t-0 pt-0">
      <CardTitle dica="Só despesas da conta e do cartão. Transferências ficam de fora.">Para onde foi o dinheiro</CardTitle>
      {!linhas.length ? (
        <p className="text-[14px] text-ink-mute">Nenhuma despesa neste mês. Lance uma ou importe o extrato logo abaixo.</p>
      ) : (
        <ul className="space-y-3.5">
          {linhas.map(([cat, valor]) => {
            const pct = totais.despesas > 0 ? (valor / totais.despesas) * 100 : 0
            return (
              <li key={cat} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5">
                <span className="truncate text-[14px] text-ink" title={cat}>{cat}</span>
                <span className="num text-right text-[14px] font-semibold">
                  {fmtBRL(valor)} <span className="ml-1 inline-block w-9 font-normal text-ink-mute">{pct.toFixed(0)}%</span>
                </span>
                <span className="col-span-2 h-2 overflow-hidden rounded-full bg-paper-2" aria-hidden="true">
                  <span className="block h-full rounded-full" style={{ width: `${(valor / maior) * 100}%`, background: corDaCategoria(cat) }} />
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
