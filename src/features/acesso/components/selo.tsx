import { useMemo } from 'react'
import { desenharGuilloche } from '@/features/painel/guilloche'

/**
 * Guilhochê das cédulas como marca-d'água do painel de entrada — o mesmo
 * desenho da faixa de resultado (docs/design.md). Parado, em traço branco.
 */
export function Selo({ className }: { className?: string }) {
  const { rosetao, faixa } = useMemo(() => desenharGuilloche(120, 120, 10), [])
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <g fill="none" stroke="#fff" strokeWidth="0.7">
        {faixa.map((d, i) => <path key={'f' + i} d={d} />)}
        {rosetao.map((d, i) => <path key={'r' + i} d={d} />)}
      </g>
    </svg>
  )
}
