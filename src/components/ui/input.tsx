import * as React from 'react'
import { cn } from '@/lib/utils'

const campo =
  'w-full rounded-sm border border-rule-strong bg-sheet px-3 py-2 text-[14px] text-ink transition-colors ' +
  'placeholder:text-ink-mute hover:border-ink-mute focus-visible:outline focus-visible:outline-2 ' +
  'focus-visible:outline-offset-1 focus-visible:outline-ring disabled:opacity-50'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(campo, 'h-9', className)} {...props} />,
)
Input.displayName = 'Input'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(campo, 'min-h-[80px]', className)} {...props} />,
)
Textarea.displayName = 'Textarea'

export { Input, Textarea }
