import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, interactive = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return <div className={cn('glass-card rounded-2xl border border-border p-5', interactive && 'card-hover', className)} {...props} />
}
