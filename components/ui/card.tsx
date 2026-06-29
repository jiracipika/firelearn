import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-[1.35rem] border border-white/[0.09] bg-card/78 p-5 shadow-[0_24px_80px_rgb(0_0_0_/_0.28)] ring-1 ring-white/[0.025] backdrop-blur-xl', className)} {...props} />
}
