export default function Loading() {
  return <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
    <div className="space-y-8">
      <div className="h-10 w-2/3 animate-pulse rounded-lg bg-elevated/80 md:w-1/3" />
      <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
        <div className="h-56 animate-pulse rounded-2xl border border-border bg-card/60" />
        <div className="h-56 animate-pulse rounded-2xl border border-border bg-card/60" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-card/40" />)}
      </div>
    </div>
  </main>
}
