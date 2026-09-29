import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import * as React from 'react'
import { cn } from '@/lib/utils'

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn('flex flex-wrap gap-[9px]', className)} {...props} />
))
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

/** Opção em formato de pílula clicável. */
const RadioPill = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'inline-flex items-center gap-2 rounded-full border border-rule-strong bg-sheet px-3.5 py-1.5 text-[13px] font-medium',
      'transition-colors hover:border-accent data-[state=checked]:border-accent data-[state=checked]:bg-accent/[.08]',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      className,
    )}
    {...props}
  >
    <span className="grid size-3.5 place-content-center rounded-full border border-rule-strong bg-sheet">
      <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-accent" />
    </span>
    {children}
  </RadioGroupPrimitive.Item>
))
RadioPill.displayName = 'RadioPill'

export { RadioGroup, RadioPill }
