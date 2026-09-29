import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Cartão de conteúdo: folha branca, canto arredondado, sombra leve.
 * Um assunto por cartão; o título vem em CardTitle (ver docs/design.md).
 */
const Card = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <section ref={ref} className={cn('rounded-lg border border-rule bg-sheet p-5 shadow-nota sm:p-6', className)} {...props} />
))
Card.displayName = 'Card'

/** Título do cartão em caixa normal; `dica` explica em uma linha, abaixo; `acao` fica à direita. */
function CardTitle({ className, dica, children, acao, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { dica?: React.ReactNode; acao?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className={cn('text-[17px] font-semibold leading-tight tracking-[-.01em] text-ink', className)} {...props}>
          {children}
        </h2>
        {dica && <p className="mt-1 max-w-[62ch] text-[13px] text-ink-mute">{dica}</p>}
      </div>
      {acao}
    </div>
  )
}

/** Moldura interna para tabelas dentro de um cartão. */
function Superficie({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-md border border-rule', className)} {...props} />
}

export { Card, CardTitle, Superficie }
