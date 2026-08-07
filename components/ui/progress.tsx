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
        className="relative h-full rounded-full bg-gradient-to-r from-primary via-red-400 to-accent transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ width: `${safeValue}%` }}
      >
        {/* Animated shine that sweeps across the filled portion while there is
            progress. Kept subtle (low opacity) so it reads as polish, not noise. */}
        {safeValue > 4 && safeValue < 100 && (
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.35),transparent)] bg-[length:200%_100%]"
            style={{ animation: 'progress-shine 2.4s linear infinite' }}
          />
        )}
        {/* Completed cap — a soft glow on the right edge of the fill once full. */}
        {safeValue === 100 && (
          <span
            aria-hidden
            className="absolute inset-y-0 right-0 w-6 bg-[radial-gradient(circle_at_right,rgb(66_211_146/0.6),transparent_70%)]"
          />
        )}
      </div>
    </div>
  )
}
