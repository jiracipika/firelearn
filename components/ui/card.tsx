import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-border bg-card/88 p-5 shadow-[0_14px_36px_rgb(0_0_0_/_0.28)] backdrop-blur-xl transition-colors duration-200 card-hover', className)} {...props} />
}
