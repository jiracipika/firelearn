import { cn } from '@/lib/utils'

export function Progress({ value, className }: { value: number; className?: string }) {
  const safeValue = Math.min(Math.max(value, 0), 100)
  return <div className={cn('h-2 overflow-hidden rounded-full bg-border', className)}><div className="h-full rounded-full bg-gradient-to-r from-primary via-red-400 to-accent transition-[width] duration-500 ease-out" style={{ width: `${safeValue}%` }} /></div>
}
