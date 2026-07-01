import type { Flashcard } from '@/types/learning'

export type FlashcardReviewRating = 'again' | 'hard' | 'good' | 'easy'

export type FlashcardReviewEvent = {
  flashcardId: string
  rating: FlashcardReviewRating
  reviewedAt: string
  nextReview?: string
}

export type FlashcardSessionSummary = {
  reviewedCount: number
  ratingCounts: Record<FlashcardReviewRating, number>
  retentionPercent: number
  againRatePercent: number
  nextDueAt?: string
  difficultFlashcardIds: string[]
}

const emptyRatingCounts = (): Record<FlashcardReviewRating, number> => ({
  again: 0,
  hard: 0,
  good: 0,
  easy: 0,
})

export function summarizeFlashcardSession(events: FlashcardReviewEvent[]): FlashcardSessionSummary {
  const ratingCounts = emptyRatingCounts()
  const difficult = new Set<string>()
  let nextDueAt: string | undefined

  for (const event of events) {
    ratingCounts[event.rating] += 1
    if (event.rating === 'again' || event.rating === 'hard') difficult.add(event.flashcardId)
    if (event.nextReview && (!nextDueAt || event.nextReview < nextDueAt)) nextDueAt = event.nextReview
  }

  const reviewedCount = events.length
  const retainedCount = ratingCounts.good + ratingCounts.easy
  const retentionPercent = reviewedCount === 0 ? 0 : Math.round((retainedCount / reviewedCount) * 100)
  const againRatePercent = reviewedCount === 0 ? 0 : Math.round((ratingCounts.again / reviewedCount) * 100)

  return {
    reviewedCount,
    ratingCounts,
    retentionPercent,
    againRatePercent,
    nextDueAt,
    difficultFlashcardIds: Array.from(difficult).sort(),
  }
}

export function findDueFlashcards(flashcards: Flashcard[], nowIso = new Date().toISOString()): Flashcard[] {
  const today = nowIso.slice(0, 10)
  return flashcards
    .filter((card) => card.nextReview.slice(0, 10) <= today)
    .sort((a, b) => a.nextReview.localeCompare(b.nextReview) || a.front.localeCompare(b.front))
}
