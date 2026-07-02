import type { Course, Flashcard } from '@/types/learning'
import type { StorageLike } from '@/services/local-persistence'
import { loadFlashcards } from '@/services/local-persistence'
import { buildReviewQueue } from '@/services/spaced-repetition'

export type FlashcardQueueSummary = {
  totalCards: number
  dueToday: number
  overdue: number
  dueCount: number
  newCards: number
  learning: number
  mature: number
}

export function getCatalogFlashcards(courses: Course[]): Flashcard[] {
  return courses.flatMap((course) =>
    course.modules.flatMap((courseModule) => courseModule.lessons.flatMap((lesson) => lesson.flashcards))
  )
}

export function mergeStoredFlashcards(catalogCards: Flashcard[], storedById: Record<string, Flashcard>): Flashcard[] {
  return catalogCards.map((card) => storedById[card.id] ?? card)
}

export function summarizeFlashcardQueue(cards: Flashcard[], now = new Date()): FlashcardQueueSummary {
  const queue = buildReviewQueue(cards, now)

  return {
    totalCards: cards.length,
    dueToday: queue.dueToday.length,
    overdue: queue.overdue.length,
    dueCount: queue.dueToday.length + queue.overdue.length,
    newCards: queue.newCards.length,
    learning: queue.learning.length,
    mature: queue.mature.length,
  }
}

export function loadFlashcardQueueSummary(storage: StorageLike, courses: Course[], now = new Date()): FlashcardQueueSummary {
  const catalogCards = getCatalogFlashcards(courses)
  const cards = mergeStoredFlashcards(catalogCards, loadFlashcards(storage))
  return summarizeFlashcardQueue(cards, now)
}
