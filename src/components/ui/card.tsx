import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Seção do extrato: separada por espaço e uma linha fina, sem caixa.
 * (Superfície com fundo próprio só onde há objeto — ver docs/design.md.)
 */
const Card = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <section ref={ref} className={cn('border-t border-rule py-8', className)} {...props} />
))
Card.displayName = 'Card'

/** Título da seção em caixa normal; `dica` explica em uma linha, abaixo. */
function CardTitle({ className, dica, children, acao, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { dica?: React.ReactNode; acao?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className={cn('text-[20px] font-semibold leading-tight tracking-[-.01em] text-ink', className)} {...props}>
          {children}
        </h2>
        {dica && <p className="mt-1 max-w-[62ch] text-[13px] text-ink-mute">{dica}</p>}
      </div>
      {acao}
    </div>
  )
}

/** Superfície de papel (para a cédula e tabelas). */
function Superficie({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-rule bg-sheet', className)} {...props} />
}

export { Card, CardTitle, Superficie }
