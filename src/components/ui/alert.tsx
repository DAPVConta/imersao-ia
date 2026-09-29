import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const alertVariants = cva('mb-6 rounded-md border-l-[3px] bg-sheet px-4 py-3 text-[14px] text-ink shadow-nota', {
  variants: {
    variant: {
      ok: 'border-l-credit',
      erro: 'border-l-debit text-debit-deep',
    },
  },
  defaultVariants: { variant: 'ok' },
})

function Alert({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return <div role={variant === 'erro' ? 'alert' : 'status'} className={cn(alertVariants({ variant }), className)} {...props} />
}

export { Alert, alertVariants }
