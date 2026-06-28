
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

  return <AppShell><div className="mx-auto max-w-4xl space-y-6">
    <div className="space-y-3"><Badge>Global search</Badge><h1 className="text-4xl font-semibold">Search FireLearn</h1><p className="text-muted">Instant filtering across courses, lessons, flashcards, topics, and quiz questions.</p></div>
    <div className="relative"><Search className="pointer-events-none absolute left-4 top-3.5 size-5 text-muted" /><Input className="pl-12" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try SCBA, smoke, SOP, Mayday..." autoFocus aria-label="Search FireLearn" /></div>
    <div className="grid gap-3">{results.map((result) => <Link key={`${result.type}-${result.id}`} href={result.href}><Card className="transition hover:border-primary/40 hover:bg-white/[0.05]"><div className="flex flex-wrap items-center gap-2"><Badge>{result.type}</Badge><h2 className="font-semibold">{result.title}</h2></div><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{result.description}</p></Card></Link>)}</div>
    {results.length === 0 && <Card className="text-center text-muted">No results found.</Card>}
  </div></AppShell>
}
