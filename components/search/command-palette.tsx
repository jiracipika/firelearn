'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { buildSearchIndex, searchFireLearn } from '@/lib/search'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const index = React.useMemo(() => buildSearchIndex(), [])
  const results = React.useMemo(() => searchFireLearn(query, index).slice(0, 8), [index, query])

  const closePalette = React.useCallback(() => {
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
  }, [])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
      if (event.key === 'Escape') closePalette()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closePalette])

  function go(href: string) {
    closePalette()
    router.push(href)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => Math.min(current + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const selected = results[activeIndex]
      if (selected) go(selected.href)
    }
  }

  if (!open) return null

  return <div className="fixed inset-0 z-[100] bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Command palette">
    <div className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-2xl border border-border-bright bg-background shadow-2xl">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Search size={18} className="text-muted" />
        <Input
          className="border-0 bg-transparent px-0 shadow-none focus:ring-0"
          value={query}
          onChange={(event) => { setQuery(event.target.value); setActiveIndex(0) }}
          onKeyDown={handleKeyDown}
          placeholder="Search lessons, courses, flashcards, topics..."
          autoFocus
          aria-label="Command palette search"
        />
        <button type="button" onClick={closePalette} className="rounded-lg p-2 text-muted hover:bg-elevated hover:text-white" aria-label="Close search">
          <X size={18} />
        </button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-2">
        {results.map((result, i) => (
          <button
            key={`${result.type}-${result.id}`}
            type="button"
            onClick={() => go(result.href)}
            className={`block w-full rounded-xl px-3 py-3 text-left transition hover:bg-elevated ${i === activeIndex ? 'bg-elevated ring-1 ring-primary/30' : ''}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{result.type}</Badge>
              <span className="font-semibold text-white">{result.title}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{result.description}</p>
          </button>
        ))}
        {results.length === 0 && <div className="px-4 py-10 text-center text-sm text-muted-foreground">No results found.</div>}
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted">
        <span>↑↓ to navigate · Enter to select · Esc to close</span>
        <Link href="/search" onClick={closePalette} className="font-semibold text-primary">Open full search</Link>
      </div>
    </div>
  </div>
}
