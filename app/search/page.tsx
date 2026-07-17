import type { Metadata } from 'next'
import { GlobalSearch } from '@/components/search/global-search'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search across all FireLearn courses, lessons, flashcards, topics, and quiz questions.',
  robots: { index: false },
}

export default function SearchPage() {
  return <GlobalSearch />
}
