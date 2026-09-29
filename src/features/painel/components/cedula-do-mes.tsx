import { useMemo } from 'react'
import type { PontoMensal } from '@/features/financas/calculos'
import type { Totais } from '@/features/financas/tipos'
import { useContagem } from '@/hooks/use-contagem'
import { fmtBRL } from '@/lib/formato'
import { nomeDoMes } from '@/lib/formato-mes'
import { cn } from '@/lib/utils'
import { desenharGuilloche } from '../guilloche'

const C = 120 // centro do desenho (viewBox 240 × 240)
const R_ANEL = 108

/** O rosetão de guilhochê; o anel externo mostra a fração da receita que sobrou. */
function Rosetao({ semente, poupanca }: { semente: number; poupanca: number }) {
  const { rosetao, faixa } = useMemo(() => desenharGuilloche(C, C, semente), [semente])
  const fracao = Math.max(0, Math.min(1, poupanca / 100))
  return (
    <svg viewBox="0 0 240 240" className="size-full" role="img" aria-label={`Sobrou ${poupanca.toFixed(0)}% do que entrou`}>
      <g fill="none" strokeWidth="0.7" aria-hidden="true">
        {faixa.map((d, i) => (
          <path key={'f' + i} d={d} pathLength={1} stroke="rgb(var(--accent))" strokeOpacity=".6"
            className="gravar" style={{ animationDelay: `${i * 60}ms` }} />
        ))}
        {rosetao.map((d, i) => (
          <path key={'r' + i} d={d} pathLength={1} stroke={i % 2 ? 'rgb(var(--credit))' : 'rgb(var(--accent))'} strokeOpacity=".8"
            className="gravar" style={{ animationDelay: `${200 + i * 45}ms` }} />
        ))}
      </g>
      {/* anel: trilho + fração que sobrou */}
      <circle cx={C} cy={C} r={R_ANEL} fill="none" stroke="rgb(var(--rule))" strokeWidth="3" />
      {fracao > 0 && (
        <circle
          cx={C} cy={C} r={R_ANEL} fill="none" stroke="rgb(var(--credit))" strokeWidth="3" strokeLinecap="round"
          pathLength={1} strokeDasharray={`${fracao} 1`} transform={`rotate(-90 ${C} ${C})`}
          className="anel-poupanca" style={{ ['--fracao' as string]: fracao }}
        />
      )}
      <circle cx={C} cy={C} r="36" fill="rgb(var(--sheet))" />
      <text x={C} y={C + 6} textAnchor="middle" className="fill-ink font-cedula text-[27px] font-semibold [font-variation-settings:'opsz'_18]">
        {poupanca.toFixed(0)}%
      </text>
      <text x={C} y={C + 20} textAnchor="middle" className="fill-ink-mute text-[9px]">guardado</text>
    </svg>
  )
}

/**
 * A cédula do mês — a assinatura visual do painel (docs/design.md).
 * Mostra quanto sobrou (ou faltou), o que entrou e saiu, e compara com o mês anterior.
 */
export function CedulaDoMes({
  chave, totais, serie, saldoPrevisto,
}: { chave: string; totais: Totais; serie: PontoMensal[]; saldoPrevisto: number }) {
  const animado = useContagem(totais.saldo, 1100)
  const semDados = totais.receitas === 0 && totais.despesas === 0
  const faltou = totais.saldo < 0
  const poupanca = totais.receitas > 0 ? Math.max(0, (totais.saldo / totais.receitas) * 100) : 0
  const mes = nomeDoMes(chave)
  const semente = parseInt(chave.slice(5, 7), 10)

  const idx = serie.findIndex((s) => s.chave === chave)
  const anterior = idx > 0 ? serie[idx - 1] : null
  let comparacao = 'Primeiro mês registrado.'
  if (anterior) {
    const dif = totais.saldo - anterior.saldo
    const nomeAnt = nomeDoMes(anterior.chave)
    comparacao = Math.abs(dif) < 0.005
      ? `Igual a ${nomeAnt}.`
      : `${fmtBRL(Math.abs(dif))} ${dif > 0 ? 'a mais' : 'a menos'} do que em ${nomeAnt}.`
  }

  return (
    <section aria-label={`Resumo de ${mes}`} className="grid items-center gap-6 rounded-lg border border-rule bg-sheet px-5 py-6 shadow-nota sm:grid-cols-[minmax(180px,240px)_1fr] sm:gap-10 sm:px-9 sm:py-8">
      <div className="mx-auto w-[200px] sm:w-full" key={chave}>
        <Rosetao semente={semente} poupanca={poupanca} />
      </div>

      <div className="min-w-0">
        <p className="text-[15px] text-ink-2">
          {semDados ? `${mes[0].toUpperCase() + mes.slice(1)} ainda não tem lançamentos` : `${faltou ? 'Faltou' : 'Sobrou'} em ${mes}`}
        </p>
        <p
          className={cn(
            'num mt-1 font-cedula text-[clamp(44px,8vw,80px)] font-semibold leading-[1.02] tracking-[-.015em] [font-variation-settings:"opsz"_28]',
            faltou ? 'text-debit-deep' : 'text-ink',
          )}
        >
          {fmtBRL(Math.abs(animado))}
        </p>

        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-[14px]">
          <div>
            <dt className="text-ink-mute">Entrou</dt>
            <dd className="num text-[18px] font-semibold text-credit-deep">{fmtBRL(totais.receitas)}</dd>
          </div>
          <div>
            <dt className="text-ink-mute">Saiu</dt>
            <dd className="num text-[18px] font-semibold text-debit-deep">{fmtBRL(totais.despesas)}</dd>
          </div>
        </dl>

        <p className="mt-4 max-w-[60ch] text-[14px] text-ink-2">
          {comparacao}
          {Math.abs(saldoPrevisto - totais.saldo) >= 0.005 && (
            <> Contando o que está na agenda, o mês deve fechar em <strong className="num font-semibold">{fmtBRL(saldoPrevisto)}</strong>.</>
          )}
        </p>
      </div>
    </section>
  )
}
