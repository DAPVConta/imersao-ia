import * as SelectPrimitive from '@radix-ui/react-select'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, ChevronDown } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

const Select = SelectPrimitive.Root
const SelectValue = SelectPrimitive.Value

const triggerVariants = cva(
  'flex items-center justify-between gap-2 whitespace-nowrap rounded-sm border text-left transition-colors ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ' +
    'disabled:opacity-50 [&>span]:truncate',
  {
    variants: {
      variant: {
        default: 'w-full border-input bg-sheet text-ink hover:border-ink-mute [&>svg]:text-ink-mute',
        /** Seletor de mês sobre a faixa escura do topo. */
        glass:
          'rounded-[11px] border-white/[.22] bg-white/[.12] font-bold text-on-navy backdrop-blur-md hover:bg-white/[.18] [&>svg]:text-gold',
      },
      size: {
        default: 'h-[38px] px-3 text-sm',
        sm: 'h-8 px-2.5 text-xs',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & VariantProps<typeof triggerVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <SelectPrimitive.Trigger ref={ref} className={cn(triggerVariants({ variant, size }), className)} {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 shrink-0 opacity-80" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        'relative z-50 max-h-[min(var(--radix-select-content-available-height),340px)] min-w-[8rem] overflow-hidden rounded-md border border-rule bg-popover text-popover-foreground shadow-lift',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
        position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)] translate-y-1',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-[8px] py-1.5 pl-2 pr-8 text-[13px] outline-none',
      'focus:bg-paper-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-4 text-credit" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
