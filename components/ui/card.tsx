import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, interactive = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return <div className={cn('glass-card rounded-2xl border border-white/[0.08] p-5 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] card-hover', interactive && 'sheen-on-hover', className)} {...props} />
}
