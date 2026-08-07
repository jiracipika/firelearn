import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, interactive = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return <div className={cn('rounded-lg border border-border bg-card/88 p-5 shadow-[0_14px_36px_rgb(0_0_0_/_0.28)] backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-200 card-hover', interactive && 'sheen-on-hover', className)} {...props} />
}
