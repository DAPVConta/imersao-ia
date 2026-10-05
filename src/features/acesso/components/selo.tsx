import { LockKeyhole } from 'lucide-react'
import { useMemo } from 'react'
import { desenharGuilloche } from '@/features/painel/guilloche'

const C = 120

/**
 * Selo de segurança da entrada: o mesmo guilhochê da cédula — o rendilhado que
 * protege as notas contra falsificação —, aqui parado, com um cadeado no meio.
 * Não anima: o único movimento automático do site é a cédula do mês.
 */
export function Selo({ className }: { className?: string }) {
  const { rosetao, faixa } = useMemo(() => desenharGuilloche(C, C, 3), [])
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <g fill="none" strokeWidth="0.6">
        {faixa.map((d, i) => <path key={'f' + i} d={d} stroke="rgb(var(--accent))" strokeOpacity=".45" />)}
        {rosetao.map((d, i) => (
          <path key={'r' + i} d={d} stroke={i % 2 ? 'rgb(var(--credit))' : 'rgb(var(--accent))'} strokeOpacity=".6" />
        ))}
      </g>
      <circle cx={C} cy={C} r="108" fill="none" stroke="rgb(var(--rule))" strokeWidth="3" />
      <circle cx={C} cy={C} r="34" fill="rgb(var(--sheet))" stroke="rgb(var(--rule))" />
      <LockKeyhole x={C - 13} y={C - 13} width={26} height={26} stroke="rgb(var(--ink))" strokeWidth={1.6} />
    </svg>
  )
}
