import * as React from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('h-11 w-full rounded-xl border border-border-bright bg-elevated/80 px-4 text-sm text-white placeholder:text-muted shadow-inner shadow-black/20 outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20', className)} {...props} />
}
