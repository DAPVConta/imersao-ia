import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-semibold transition-colors ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ' +
    'disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        /** Ação principal da seção (uma por vez). */
        default: 'bg-accent text-accent-foreground hover:bg-accent-deep',
        outline: 'border border-rule-strong bg-sheet text-ink hover:border-ink-mute hover:bg-sheet-2',
        ghost: 'text-ink-2 hover:bg-paper-2 hover:text-ink',
        destructive: 'border border-debit/40 bg-sheet text-debit-deep hover:bg-debit/10',
        /** Ação de texto, sem caixa (links de navegação no topo). */
        link: 'h-auto px-0 text-ink-2 underline-offset-4 hover:text-ink hover:underline',
      },
      size: {
        default: 'h-9 px-3.5 text-[13.5px]',
        sm: 'h-8 px-2.5 text-[13px]',
        icon: 'size-8 text-[13px]',
      },
    },
    defaultVariants: { variant: 'outline', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
