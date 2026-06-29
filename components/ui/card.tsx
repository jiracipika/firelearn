import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-border bg-card/80 p-5 shadow-[0_12px_48px_rgb(0_0_0_/_0.35)] backdrop-blur-xl transition-colors duration-200', className)} {...props} />
}
