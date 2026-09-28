import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative z-[1] mb-[15px] animate-fade-up rounded-md border border-l-4 px-[15px] py-3 text-[12.5px] font-semibold shadow-sm',
  {
    variants: {
      variant: {
        ok: 'border-credit/40 bg-sheet text-credit-deep',
        erro: 'border-debit/40 bg-sheet text-debit-deep',
      },
    },
    defaultVariants: { variant: 'ok' },
  },
)

function Alert({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return <div role={variant === 'erro' ? 'alert' : 'status'} className={cn(alertVariants({ variant }), className)} {...props} />
}

export { Alert, alertVariants }
