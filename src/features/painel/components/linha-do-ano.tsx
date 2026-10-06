import { Card, CardTitle } from '@/components/ui/card'
import type { PontoMensal } from '@/features/financas/calculos'
import { irParaMes } from '@/features/financas/navegacao'
import { fmtBRL, fmtCompacto, rotuloMes } from '@/lib/formato'
import { mesPorExtenso } from '@/lib/formato-mes'

const ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const COL = 68 // largura de cada mês, em pixels reais (o desenho não estica)
const H = 236, MEIO = 108, ALT = 76 // altura total, linha do zero, altura máxima de cada lado

/**
 * O ano em uma linha: entradas crescem para cima, saídas para baixo.
 * Cada mês é um botão — clicar abre aquele mês.
 */
export function LinhaDoAno({ serie, mesAtual }: { serie: PontoMensal[]; mesAtual: string | null }) {
  if (!serie.length) return null
  const max = Math.max(1, ...serie.map((d) => Math.max(d.receitas, d.despesas)))
  const esc = (v: number) => (v / max) * ALT
  const LEGENDA = 150 // espaço à direita para o rótulo da média
  const W = serie.length * COL + LEGENDA
  const offset = 0
  const mediaGastos = serie.reduce((s, d) => s + d.despesas, 0) / serie.length
  const yMedia = MEIO + esc(mediaGastos)

  return (
    <Card>
      <CardTitle
        dica="Entradas para cima, saídas para baixo. Clique num mês para abri-lo."
        acao={
          <span className="flex items-center gap-4 text-[12.5px] text-ink-mute">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-credit" />Entrou</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-debit" />Saiu</span>
          </span>
        }
      >
        O ano mês a mês
      </CardTitle>
      <div className="-mx-1 overflow-x-auto px-1">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" role="group" aria-label="Entradas e saídas por mês">
          <line x1="0" x2={serie.length * COL} y1={MEIO} y2={MEIO} stroke="rgb(var(--rule-strong))" />
          {serie.length > 1 && (
            <g aria-hidden="true">
              <line x1="0" x2={serie.length * COL + 8} y1={yMedia} y2={yMedia} stroke="rgb(var(--debit))" strokeOpacity=".6" strokeDasharray="2 4" />
              <text x={serie.length * COL + 14} y={yMedia + 4} className="svg-lbl">média de saídas</text>
              <text x={serie.length * COL + 14} y={yMedia + 18} className="svg-lbl num font-semibold">{fmtCompacto(mediaGastos)}</text>
            </g>
          )}
          {serie.map((d, i) => {
            const x = offset + i * COL
            const cx = x + COL / 2
            const atual = d.chave === mesAtual
            const [ano, mes] = d.chave.split('-')
            const hR = esc(d.receitas), hD = esc(d.despesas)
            const mostraAno = i === 0 || mes === '01'
            const abrir = () => irParaMes(d.chave)
            return (
              <g
                key={d.chave} role="button" tabIndex={0} aria-pressed={atual}
                aria-label={`${mesPorExtenso(d.chave)}: entrou ${fmtBRL(d.receitas)}, saiu ${fmtBRL(d.despesas)}`}
                onClick={abrir}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir() } }}
                className="group cursor-pointer outline-none"
              >
                <title>{`${rotuloMes(d.chave)} — entrou ${fmtBRL(d.receitas)}, saiu ${fmtBRL(d.despesas)}`}</title>
                <rect x={x + 3} y="6" width={COL - 6} height={H - 12} rx="8"
                  className={atual ? 'fill-paper-2' : 'fill-transparent group-hover:fill-paper-2/60 group-focus-visible:fill-paper-2'} />
                {atual && <rect x={x + 3} y="6" width={COL - 6} height={H - 12} rx="8" fill="none" stroke="rgb(var(--accent))" strokeWidth="1.5" />}
                <rect x={cx - 12} y={MEIO - hR} width="24" height={Math.max(hR, d.receitas > 0 ? 2 : 0)} rx="3"
                  fill="rgb(var(--credit))" opacity={atual ? 1 : 0.55} />
                <rect x={cx - 12} y={MEIO + 1} width="24" height={Math.max(hD, d.despesas > 0 ? 2 : 0)} rx="3"
                  fill="rgb(var(--debit))" opacity={atual ? 1 : 0.55} />
                {atual && (
                  <g className="num text-[11px] font-semibold">
                    <text x={cx} y={MEIO - hR - 6} textAnchor="middle" className="fill-credit-deep">{fmtCompacto(d.receitas)}</text>
                    <text x={cx} y={MEIO + hD + 15} textAnchor="middle" className="fill-debit-deep">{fmtCompacto(d.despesas)}</text>
                  </g>
                )}
                <text x={cx} y={H - 26} textAnchor="middle" className={atual ? 'fill-ink text-[13px] font-semibold' : 'fill-ink-mute text-[13px]'}>
                  {ABREV[parseInt(mes, 10) - 1]}
                </text>
                {mostraAno && <text x={cx} y={H - 12} textAnchor="middle" className="svg-lbl">{ano}</text>}
              </g>
            )
          })}
        </svg>
      </div>
    </Card>
  )
}
