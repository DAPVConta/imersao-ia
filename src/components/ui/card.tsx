import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('hairline mb-5 animate-fade-up rounded-lg bg-card px-[22px] py-5 text-card-foreground shadow', className)}
    {...props}
  />
))
Card.displayName = 'Card'

/** Título em caixa-alta com linha embaixo; `dica` aparece ao lado, discreta. */
function CardTitle({ className, dica, children, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { dica?: React.ReactNode }) {
  return (
    <h2
      className={cn(
        'mb-[15px] flex flex-wrap items-baseline gap-[9px] border-b border-rule pb-[11px] text-[12.5px] font-extrabold uppercase tracking-[.1em]',
        className,
      )}
      {...props}
    >
      {children}
      {dica && <span className="text-[11px] font-medium normal-case tracking-normal text-ink-mute">{dica}</span>}
    </h2>
  )
}

export { Card, CardTitle }
