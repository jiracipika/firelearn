'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { buildSearchIndex, searchFireLearn } from '@/lib/search'
import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function GlobalSearch() {
  const [query, setQuery] = React.useState('')
  const index = React.useMemo(() => buildSearchIndex(), [])
  const results = React.useMemo(() => searchFireLearn(query, index), [index, query])

  return <AppShell><div className="mx-auto max-w-3xl space-y-6">
    <div className="space-y-2">
      <Badge>Global search</Badge>
      <h1 className="text-4xl font-bold tracking-tight text-white">Search FireLearn</h1>
      <p className="text-muted-foreground">Instant filtering across courses, lessons, flashcards, topics, and quiz questions.</p>
    </div>
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
      <Input className="pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try SCBA, smoke, SOP, Mayday..." autoFocus aria-label="Search FireLearn" />
    </div>
    <div className="grid gap-3">
      {results.map((result) => (
        <Link key={`${result.type}-${result.id}`} href={result.href}>
          <Card className="transition hover:border-primary/30 hover:bg-elevated/60">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{result.type}</Badge>
              <h2 className="font-bold text-white">{result.title}</h2>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{result.description}</p>
          </Card>
        </Link>
      ))}
    </div>
    {results.length === 0 && query.length > 0 && <Card className="py-12 text-center text-muted-foreground">No results found.</Card>}
  </div></AppShell>
}
