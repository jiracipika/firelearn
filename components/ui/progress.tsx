import { cn } from '@/lib/utils'

export function Progress({ value, className }: { value: number; className?: string }) {
  const safeValue = Math.min(Math.max(value, 0), 100)
  return <div className={cn('h-2.5 overflow-hidden rounded-full border border-white/[0.06] bg-black/35 shadow-inner shadow-black/40', className)}><div className="h-full rounded-full bg-gradient-to-r from-primary via-red-400 to-accent shadow-[0_0_22px_rgb(255_59_34_/_0.42)] transition-[width] duration-500" style={{ width: `${safeValue}%` }} /></div>
}
