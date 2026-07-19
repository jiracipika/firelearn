import type { Metadata } from 'next'
import { Suspense } from 'react'
import { GlobalSearch } from '@/components/search/global-search'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search across all FireLearn courses, lessons, flashcards, topics, and quiz questions.',
  robots: { index: false },
}

export default function SearchPage() {
  // GlobalSearch now reads `?q=` from the URL via useSearchParams, which needs
  // a Suspense boundary so the static shell can render without bailing out
  // the whole route to client-only rendering.
  return (
    <Suspense fallback={null}>
      <GlobalSearch />
    </Suspense>
  )
}
