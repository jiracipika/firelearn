import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Lightweight skeleton block powered by the global `.skeleton` shimmer
 * animation (defined in app/globals.css). Use as a placeholder while data
 * loads — pairs with the page-level loading.tsx files and inline Suspense
 * fallbacks.
 *
 * Pass any className to override width/height/rounding. The shimmer sweep
 * itself is theme-aware (the light theme overrides are in globals.css).
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        'skeleton rounded-md border border-border/60',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Skeleton card mirroring the layout of the primary dashboard hero Card so the
 * loading state reads as the real shape, not a blank rectangle.
 */
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-border bg-card/60 p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="size-10 rounded-xl" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/**
 * Skeleton grid of stat tiles — used by dashboard and course-detail loading
 * fallbacks. Renders `count` tile placeholders in a responsive grid.
 */
export function SkeletonStatGrid({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-border bg-elevated/40 p-4">
          <Skeleton className="size-10 rounded-xl" />
          <Skeleton className="mt-3 h-6 w-16" />
          <Skeleton className="mt-1 h-3 w-20" />
        </div>
      ))}
    </div>
  )
}
