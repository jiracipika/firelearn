export default function Loading() {
  return <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
    <div className="grid gap-4 md:grid-cols-3">
      {[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-card/40" />)}
    </div>
  </main>
}
