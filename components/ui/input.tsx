import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-lg border border-border-bright bg-elevated/80 px-4 text-sm text-white placeholder:text-muted outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20',
          className
        )}
        {...props}
      />
    )
  }
)
