import * as React from 'react'
import { cn } from '@/lib/utils'

export function Badge({
  className,
  glow = false,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { glow?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary/8 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-red-100',
        glow && 'animate-achievement-glow',
        className,
      )}
      {...props}
    />
  )
}
