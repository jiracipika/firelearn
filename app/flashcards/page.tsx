import type { Metadata } from 'next'
import { FlashcardPreview } from '@/components/flashcards/flashcard-preview'

export const metadata: Metadata = {
  title: 'Flashcard Review',
  description: 'Spaced-repetition flashcards for firefighter knowledge — SCBA, mayday, codes, and tactics kept fresh with SM-2 scheduling.',
  openGraph: {
    title: 'FireLearn Flashcards',
    description: 'SM-2 spaced-repetition flashcard review for high-recall firefighter knowledge.',
  },
}

export default async function FlashcardsPage({ searchParams }: { searchParams: Promise<{ course?: string; lesson?: string }> }) {
  const { course, lesson } = await searchParams
  return <FlashcardPreview courseSlug={course} lessonSlug={lesson} />
}
