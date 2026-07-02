import { describe, expect, it } from 'vitest'
import { createMemoryStorage, saveFlashcards } from '@/services/local-persistence'
import { getCatalogFlashcards, loadFlashcardQueueSummary, mergeStoredFlashcards, summarizeFlashcardQueue } from '@/services/flashcard-queue'
import type { Course, Flashcard } from '@/types/learning'

const now = new Date('2026-07-02T12:00:00.000Z')

function card(id: string, nextReview: string, reviewCount = 1, intervalDays = 1): Flashcard {
  return {
    id,
    front: `${id} front`,
    back: `${id} back`,
    topicIds: ['pump-operations'],
    difficulty: 'Recruit',
    easeFactor: 2.5,
    intervalDays,
    nextReview,
    reviewCount,
  }
}

const course: Course = {
  id: 'course-pump-operations',
  slug: 'pump-operations',
  title: 'Pump Operations',
  description: 'Pump operator practice',
  categoryId: 'pump-operations',
  difficulty: 'Recruit',
  estimatedMinutes: 20,
  progressPercent: 0,
  xp: 100,
  modules: [
    {
      id: 'module-pump-operations',
      title: 'Pump Operations',
      description: 'Baseline module',
      lessons: [
        {
          id: 'lesson-pump-operations',
          slug: 'pump-operations-foundations',
          title: 'Pump Operations Foundations',
          difficulty: 'Recruit',
          estimatedMinutes: 20,
          objectives: [],
          prerequisites: [],
          content: [],
          imageAlt: 'Pump operations',
          videoPlaceholder: 'Pump operations video',
          videos: [],
          knowledgeCheck: {
            id: 'question-pump-operations',
            type: 'multiple-choice',
            prompt: 'What comes first?',
            options: ['SOP review', 'Guess'],
            correctAnswerIds: ['SOP review'],
            explanation: 'Follow SOPs.',
            topicIds: ['pump-operations'],
          },
          summary: [],
          quiz: [],
          flashcards: [card('due-today', '2026-07-02T08:00:00.000Z'), card('future', '2026-07-05T08:00:00.000Z')],
          references: [],
          completion: { completed: false, percent: 0 },
        },
      ],
    },
  ],
}

describe('flashcard queue summary', () => {
  it('counts due and overdue cards separately', () => {
    const summary = summarizeFlashcardQueue([
      card('overdue', '2026-07-01T08:00:00.000Z'),
      card('due-today', '2026-07-02T08:00:00.000Z'),
      card('future', '2026-07-05T08:00:00.000Z'),
    ], now)

    expect(summary).toMatchObject({ totalCards: 3, overdue: 1, dueToday: 1, dueCount: 2 })
  })

  it('uses locally stored scheduling over catalog defaults', () => {
    const storage = createMemoryStorage()
    const catalogCards = getCatalogFlashcards([course])
    saveFlashcards(storage, [card('due-today', '2026-07-06T08:00:00.000Z')])

    const merged = mergeStoredFlashcards(catalogCards, { 'due-today': card('due-today', '2026-07-06T08:00:00.000Z') })
    expect(merged.find((item) => item.id === 'due-today')?.nextReview).toBe('2026-07-06T08:00:00.000Z')

    const summary = loadFlashcardQueueSummary(storage, [course], now)
    expect(summary.dueCount).toBe(0)
    expect(summary.totalCards).toBe(2)
  })
})
