'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { buildSearchIndex, searchFireLearn, type SearchResult } from '@/lib/search'
import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Curated popular-search chips shown when the query is empty. Drawn from the
// highest-value firefighter topics in the catalog so first-time visitors get
// one-tap entry points instead of a blank page. Kept short (6) and stable so
// the empty state stays scannable; each term must resolve to real results,
// which the empty-state render verifies before showing the chip.
const POPULAR_SEARCHES = ['SCBA', 'Mayday', 'Smoke', 'Rehab', 'Decon', 'Size-up'] as const

const MAX_RESULTS = 24

export function GlobalSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Seed the query from `?q=` so deep links (e.g. the dashboard weak-topic
  // chips) land on a pre-filled results view. Kept in sync with the URL so
  // the box reflects what the link promised.
  const [query, setQuery] = React.useState(searchParams.get('q') ?? '')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const index = React.useMemo(() => buildSearchIndex(), [])
  const results = React.useMemo(() => searchFireLearn(query, index).slice(0, MAX_RESULTS), [index, query])

  const inputRef = React.useRef<HTMLInputElement>(null)
  const resultRefs = React.useRef<(HTMLAnchorElement | null)[]>([])

  // Keep activeIndex in bounds when results shrink (typing, clearing). Uses
  // the "adjusting state during render" pattern rather than an effect to
  // avoid cascading renders and satisfy react-hooks/exhaustive-deps.
  if (activeIndex >= results.length && activeIndex !== 0) {
    setActiveIndex(0)
  }

  function syncUrl(next: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (next) params.set('q', next)
    else params.delete('q')
    const qs = params.toString()
    router.replace(qs ? `/search?${qs}` : '/search', { scroll: false })
  }

  function handleChange(value: string) {
    setQuery(value)
    setActiveIndex(0)
    syncUrl(value)
  }

  function clearQuery() {
    setQuery('')
    setActiveIndex(0)
    syncUrl('')
    inputRef.current?.focus()
  }

  // Cycle the active index with wrap-around. Mirrors the command palette so
  // the two search surfaces feel identical from the keyboard.
  function moveSelection(delta: number) {
    if (results.length === 0) return
    setActiveIndex((current) => {
      const next = current + delta
      if (next < 0) return results.length - 1
      if (next >= results.length) return 0
      return next
    })
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    // Ignore modifier-chorded keys so browser/Cmd shortcuts pass through.
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveSelection(1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveSelection(-1)
      return
    }
    if (event.key === 'Enter') {
      const selected = results[activeIndex]
      if (selected) {
        event.preventDefault()
        router.push(selected.href)
      }
      return
    }
    if (event.key === 'Escape' && query.length > 0) {
      event.preventDefault()
      clearQuery()
    }
  }

  // Scroll the active result into view when the keyboard moves the selection.
  // Uses 'nearest' so neither arrow direction causes a full-page jump.
  React.useEffect(() => {
    const el = resultRefs.current[activeIndex]
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const listboxId = 'global-search-results'
  const hasQuery = query.trim().length > 0
  const popularShown = POPULAR_SEARCHES.filter((term) =>
    // Only show chips that resolve to real results — guards against the
    // catalog changing without this constant being updated.
    results.length > 0 || searchFireLearn(term, index).length > 0,
  )

  return <AppShell><div className="mx-auto max-w-3xl space-y-6">
    <div className="space-y-2">
      <Badge>Global search</Badge>
      <h1 className="text-4xl font-bold tracking-tight text-white">Search FireLearn</h1>
      <p className="text-muted-foreground">Instant filtering across courses, lessons, flashcards, topics, and quiz questions.</p>
    </div>
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
      <Input
        ref={inputRef}
        className="pl-11 pr-10"
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Try SCBA, smoke, SOP, Mayday..."
        autoFocus
        aria-label="Search FireLearn"
        role="combobox"
        aria-expanded
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={results[activeIndex] ? `${listboxId}-opt-${activeIndex}` : undefined}
      />
      {query.length > 0 && (
        <button
          type="button"
          onClick={clearQuery}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:bg-elevated hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <X size={16} />
        </button>
      )}
    </div>

    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
      <span aria-live="polite">
        {hasQuery
          ? `${results.length} result${results.length === 1 ? '' : 's'} for “${query.trim()}”`
          : `${index.length} indexed items`}
      </span>
      <span className="hidden sm:inline">↑↓ navigate · Enter open · Esc clear</span>
    </div>

    <div className="grid gap-3" id={listboxId} role="listbox" aria-label="Search results">
      {results.map((result, i) => (
        <ResultCard
          key={`${result.type}-${result.id}`}
          ref={(el) => { resultRefs.current[i] = el }}
          result={result}
          active={i === activeIndex}
          onMouseEnter={() => setActiveIndex(i)}
          optionId={`${listboxId}-opt-${i}`}
        />
      ))}
    </div>

    {results.length === 0 && hasQuery && (
      <Card className="space-y-3 py-12 text-center text-muted-foreground">
        <p>No results found for “{query.trim()}”.</p>
        <p className="text-xs">Check spelling, try a broader term, or pick a popular topic below.</p>
        <PopularChips terms={popularShown} onPick={handleChange} />
      </Card>
    )}

    {!hasQuery && (
      <Card className="space-y-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">Popular searches to get you started:</p>
        <PopularChips terms={popularShown} onPick={handleChange} />
      </Card>
    )}
  </div></AppShell>
}

const ResultCard = React.forwardRef<HTMLAnchorElement, {
  result: SearchResult
  active: boolean
  optionId: string
  onMouseEnter: () => void
}>(function ResultCard({ result, active, optionId, onMouseEnter }, ref) {
  return (
    <Link
      ref={ref}
      href={result.href}
      id={optionId}
      role="option"
      aria-selected={active}
      onMouseEnter={onMouseEnter}
      className={cn(
        'block rounded-xl border bg-elevated/40 p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        active ? 'border-primary/50 bg-elevated/70 ring-1 ring-primary/30' : 'border-border hover:border-primary/30 hover:bg-elevated/60',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{result.type}</Badge>
        <h2 className="font-bold text-white">{result.title}</h2>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{result.description}</p>
    </Link>
  )
})

function PopularChips({ terms, onPick }: { terms: readonly string[]; onPick: (value: string) => void }) {
  if (terms.length === 0) return null
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {terms.map((term) => (
        <button
          key={term}
          type="button"
          onClick={() => onPick(term)}
          className="rounded-full border border-border bg-elevated/40 px-3 py-1.5 text-xs font-medium text-white transition hover:border-primary/50 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {term}
        </button>
      ))}
    </div>
  )
}
