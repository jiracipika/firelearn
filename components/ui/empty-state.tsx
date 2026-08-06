import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Consistent empty-state block used across the dashboard, quiz, course, and
 * flashcard surfaces. Replaces ad-hoc "No X yet" paragraphs with a centred
 * icon + title + description + optional CTA so every empty surface reads as
 * an intentional, on-brand invitation rather than dead space.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-elevated/20 px-6 py-10 text-center', className)}>
      {Icon && (
        <span className="inline-flex size-12 items-center justify-center rounded-2xl border border-border bg-elevated/60 text-muted">
          <Icon size={22} aria-hidden />
        </span>
      )}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        {description && <p className="mx-auto max-w-sm text-xs leading-5 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
