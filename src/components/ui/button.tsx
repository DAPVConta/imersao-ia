import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-semibold tracking-[.01em] ' +
    'transition-[transform,background-color,filter,box-shadow] duration-150 active:scale-[.96] ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ' +
    'disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        /** Ação principal: gradiente azul-marinho. */
        default:
          'border border-transparent bg-gradient-to-br from-navy-3 to-navy-2 text-on-navy ' +
          'shadow-[0_8px_18px_-10px_rgba(12,39,71,.65),inset_0_1px_0_rgba(255,255,255,.14)] hover:brightness-[1.14]',
        outline: 'border border-input bg-sheet text-ink hover:bg-sheet-2 hover:shadow-sm',
        ghost: 'border border-transparent bg-transparent font-medium text-ink-2 hover:stripe',
        destructive: 'border border-debit bg-sheet text-debit hover:bg-debit/10',
        /** Botões que ficam sobre a faixa escura do topo. */
        glass: 'border border-white/20 bg-white/[.12] text-on-navy backdrop-blur-md hover:bg-white/[.22]',
        'glass-ghost': 'border border-transparent bg-transparent text-on-navy-2 hover:bg-white/[.12] hover:text-on-navy',
      },
      size: {
        default: 'h-[38px] px-4 text-sm',
        sm: 'h-8 px-3 text-xs',
        icon: 'h-7 w-7 rounded-[8px] text-xs',
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
