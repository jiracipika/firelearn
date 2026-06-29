import * as React from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('min-h-12 rounded-2xl border border-white/[0.10] bg-black/25 px-4 text-sm text-white shadow-inner shadow-black/30 outline-none placeholder:text-muted/75 transition focus:border-primary/60 focus:ring-4 focus:ring-primary/15', className)} {...props} />
}
