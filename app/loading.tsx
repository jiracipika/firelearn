import { Skeleton, SkeletonStatGrid } from '@/components/ui/skeleton'

/**
 * Top-level route loading fallback. Uses the shared skeleton shimmer
 * (defined in globals.css) instead of the generic `animate-pulse` blocks so the
 * transition reads as the real dashboard shape.
 *
 * Next.js renders this file automatically for any Suspense boundary or during
 * route segment streaming, so it must stay a server component (no "use client").
 */
export default function Loading() {
  return <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
    <div className="space-y-10">
      {/* Hero headline */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-2/3 md:w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Hero + side card */}
      <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
        <div className="glass-card rounded-2xl p-6">
          <SkeletonStatGrid count={4} />
          <Skeleton className="mt-4 h-2 w-full" />
        </div>
        <Skeleton className="glass-card h-56 rounded-2xl" />
      </div>

      {/* Three-up cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass-card space-y-3 rounded-2xl p-5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="mt-2 h-2 w-full" />
          </div>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">Loading your dashboard…</p>
    </div>
  </main>
}
