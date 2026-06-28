import type { Flashcard, FlashcardRating } from '@/types/learning'

const ratingAdjustments: Record<FlashcardRating, { easeDelta: number; intervalMultiplier: number; minimumDays: number }> = {
  again: { easeDelta: -0.25, intervalMultiplier: 0, minimumDays: 0 },
  hard: { easeDelta: -0.15, intervalMultiplier: 1.2, minimumDays: 1 },
  good: { easeDelta: 0, intervalMultiplier: 2.5, minimumDays: 1 },
  easy: { easeDelta: 0.15, intervalMultiplier: 3.5, minimumDays: 4 },
}

export function scheduleReview(card: Flashcard, rating: FlashcardRating, reviewedAt = new Date()): Flashcard {
  const adjustment = ratingAdjustments[rating]
  const easeFactor = Math.max(1.3, Number((card.easeFactor + adjustment.easeDelta).toFixed(2)))
  const intervalDays = rating === 'again'
    ? 0
    : Math.max(adjustment.minimumDays, Math.round(Math.max(1, card.intervalDays) * adjustment.intervalMultiplier * (easeFactor / 2.5)))
  const nextReview = new Date(reviewedAt)
  nextReview.setDate(nextReview.getDate() + intervalDays)

  return {
    ...card,
    easeFactor,
    intervalDays,
    nextReview: nextReview.toISOString(),
    reviewCount: card.reviewCount + 1,
    lastReviewed: reviewedAt.toISOString(),
  }
}

export function isDue(card: Flashcard, now = new Date()) {
  return new Date(card.nextReview).getTime() <= now.getTime()
}

export function cardStage(card: Flashcard) {
  if (card.reviewCount === 0) return 'new'
  if (card.intervalDays < 7) return 'learning'
  return 'mature'
}
