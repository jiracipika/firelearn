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

  const dialogRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const previouslyFocused = React.useRef<HTMLElement | null>(null)

  const closePalette = React.useCallback(() => {
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
  }, [])

  // Toggle with Cmd/Ctrl+K; Escape closes when open.
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Capture focus, lock body scroll, and restore focus on close.
  React.useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    inputRef.current?.focus()

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closePalette()
      }
    }
    window.addEventListener('keydown', onEscape)

    return () => {
      window.removeEventListener('keydown', onEscape)
      document.body.style.overflow = overflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, closePalette])

  // Keep activeIndex in bounds when results shrink. Uses the "adjusting
  // state during render" pattern rather than an effect to avoid cascading
  // renders and satisfy the lint rule.
  if (activeIndex >= results.length && activeIndex !== 0) {
    setActiveIndex(0)
  }

  // Cycle the active index with wrap-around.
  const moveSelection = React.useCallback((delta: number) => {
    if (results.length === 0) return
    setActiveIndex((current) => {
      const next = current + delta
      if (next < 0) return results.length - 1
      if (next >= results.length) return 0
      return next
    })
  }, [results.length])

  function go(href: string) {
    closePalette()
    router.push(href)
  }

  // Focus trap: Tab / Shift+Tab cycle within the dialog.
  function handleTrapKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault()
      moveSelection(event.shiftKey ? -1 : 1)
      inputRef.current?.focus()
      return
    }
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
      event.preventDefault()
      const selected = results[activeIndex]
      if (selected) go(selected.href)
    }
  }

  if (!open) return null

  const listboxId = 'command-palette-results'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePalette()
      }}
    >
      <div
        ref={dialogRef}
        className="mt-16 w-full max-w-2xl overflow-hidden rounded-2xl border border-border-bright bg-background shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={handleTrapKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search size={18} className="text-muted" />
          <Input
            ref={inputRef}
            className="border-0 bg-transparent px-0 shadow-none focus:ring-0"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActiveIndex(0) }}
            placeholder="Search lessons, courses, flashcards, topics..."
            role="combobox"
            aria-label="Command palette search"
            aria-expanded
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={results[activeIndex] ? `${listboxId}-opt-${activeIndex}` : undefined}
          />
          <button type="button" onClick={closePalette} className="rounded-lg p-2 text-muted hover:bg-elevated hover:text-white" aria-label="Close search">
            <X size={18} />
          </button>
        </div>
        <div id={listboxId} role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
          {results.map((result, i) => (
            <button
              key={`${result.type}-${result.id}`}
              id={`${listboxId}-opt-${i}`}
              type="button"
              role="option"
              aria-selected={i === activeIndex}
              onClick={() => go(result.href)}
              onMouseEnter={() => setActiveIndex(i)}
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
  )
}
