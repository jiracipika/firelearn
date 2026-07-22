import { cn } from '@/lib/utils'

export function Progress({ value, className, label = 'Progress' }: { value: number; className?: string; label?: string }) {
  const safeValue = Math.min(Math.max(value, 0), 100)

  return (
    <div
      className={cn('h-2 overflow-hidden rounded-full bg-border', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary via-red-400 to-accent transition-[width] duration-500 ease-out"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}
