import type { Flashcard, FlashcardRating } from '@/types/learning'

export type CardStage = 'new' | 'learning' | 'mature'

export type ReviewQueue = {
  dueToday: Flashcard[]
  overdue: Flashcard[]
  newCards: Flashcard[]
  learning: Flashcard[]
  mature: Flashcard[]
}

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

export function isOverdue(card: Flashcard, now = new Date()) {
  const next = new Date(card.nextReview)
  return next.toDateString() !== now.toDateString() && next.getTime() < now.getTime()
}

export function cardStage(card: Flashcard): CardStage {
  if (card.reviewCount === 0) return 'new'
  if (card.intervalDays < 7) return 'learning'
  return 'mature'
}

export function buildReviewQueue(cards: Flashcard[], now = new Date()): ReviewQueue {
  return {
    dueToday: cards.filter((card) => isDue(card, now) && !isOverdue(card, now)),
    overdue: cards.filter((card) => isOverdue(card, now)),
    newCards: cards.filter((card) => cardStage(card) === 'new'),
    learning: cards.filter((card) => cardStage(card) === 'learning'),
    mature: cards.filter((card) => cardStage(card) === 'mature'),
  }
}

export function nextDueLabel(card: Flashcard) {
  if (card.intervalDays === 0) return 'later today'
  if (card.intervalDays === 1) return 'tomorrow'
  return `${card.intervalDays} days`
}
