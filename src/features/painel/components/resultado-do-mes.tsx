import { useMemo } from 'react'
import type { PontoMensal } from '@/features/financas/calculos'
import type { Totais } from '@/features/financas/tipos'
import { useContagem } from '@/hooks/use-contagem'
import { fmtBRL } from '@/lib/formato'
import { nomeDoMes } from '@/lib/formato-mes'
import { cn } from '@/lib/utils'
import { desenharGuilloche } from '../guilloche'

/** Guilhochê da cédula como marca-d'água: muda de desenho a cada mês. */
function MarcaDagua({ semente }: { semente: number }) {
  const { rosetao, faixa } = useMemo(() => desenharGuilloche(120, 120, semente), [semente])
  return (
    <svg viewBox="0 0 240 240" aria-hidden="true" className="pointer-events-none absolute -right-8 top-1/2 h-[260px] w-[260px] -translate-y-1/2 opacity-[.13] sm:right-[300px] sm:h-[300px] sm:w-[300px]">
      <g fill="none" stroke="#fff" strokeWidth="0.7">
        {faixa.map((d, i) => <path key={'f' + i} d={d} />)}
        {rosetao.map((d, i) => <path key={'r' + i} d={d} />)}
      </g>
    </svg>
  )
}

/**
 * Faixa de resultado: como o mês fechou, em uma frase e um número.
 * Verde profundo quando sobrou, carmim quando faltou (docs/design.md).
 */
export function ResultadoDoMes({
  chave, totais, serie, saldoPrevisto,
}: { chave: string; totais: Totais; serie: PontoMensal[]; saldoPrevisto: number }) {
  const animado = useContagem(totais.saldo, 900)
  const semDados = totais.receitas === 0 && totais.despesas === 0
  const faltou = totais.saldo < 0
  const mes = nomeDoMes(chave)
  const gasto = totais.receitas > 0 ? Math.min(100, (totais.despesas / totais.receitas) * 100) : totais.despesas > 0 ? 100 : 0

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
    <section
      aria-label={`Resultado de ${mes}`}
      className={cn('relative overflow-hidden rounded-lg px-5 py-6 text-white shadow-nota sm:px-8 sm:py-7', faltou ? 'faixa-faltou' : 'faixa-sobrou')}
    >
      <MarcaDagua semente={parseInt(chave.slice(5, 7), 10)} />

      <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="min-w-0">
          <p className="text-[14px] text-white/75">
            {semDados ? `${mes[0].toUpperCase() + mes.slice(1)} ainda não tem lançamentos` : `${faltou ? 'Faltou' : 'Sobrou'} em ${mes}`}
          </p>
          <p className="num mt-1 text-[clamp(38px,6vw,56px)] font-semibold leading-[1.05] tracking-[-.02em]">
            {fmtBRL(Math.abs(animado))}
          </p>
          <p className="mt-3 max-w-[60ch] text-[13.5px] text-white/80">
            {comparacao}
            {Math.abs(saldoPrevisto - totais.saldo) >= 0.005 && (
              <> Com o que está na agenda, deve fechar em <strong className="num font-semibold text-white">{fmtBRL(saldoPrevisto)}</strong>.</>
            )}
          </p>
        </div>

        <dl className="flex gap-3">
          <div className="min-w-[132px] rounded-md bg-white/12 px-4 py-3 backdrop-blur-sm">
            <dt className="text-[12.5px] text-white/75">Entrou</dt>
            <dd className="num text-[20px] font-semibold">{fmtBRL(totais.receitas)}</dd>
          </div>
          <div className="min-w-[132px] rounded-md bg-white/12 px-4 py-3 backdrop-blur-sm">
            <dt className="text-[12.5px] text-white/75">Saiu</dt>
            <dd className="num text-[20px] font-semibold">{fmtBRL(totais.despesas)}</dd>
          </div>
        </dl>
      </div>

      {!semDados && (
        <div className="relative mt-6">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/20" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(gasto)} aria-label="Parte do que entrou que foi gasta">
            <div className="h-full rounded-full bg-white/90" style={{ width: `${gasto}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[12px] text-white/75">
            <span>{gasto.toFixed(0)}% do que entrou foi gasto</span>
            <span>{Math.max(0, 100 - gasto).toFixed(0)}% ficou guardado</span>
          </div>
        </div>
      )}
    </section>
  )
}
