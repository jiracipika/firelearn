import { describe, expect, it } from 'vitest'
import { academyCourses } from '@/data/academy'
import { findDueFlashcards, summarizeFlashcardSession } from '@/services/flashcard-session'

describe('flashcard session summary', () => {
  it('summarizes rating counts and retention signals', () => {
    const summary = summarizeFlashcardSession([
      { flashcardId: 'a', rating: 'again', reviewedAt: '2026-06-30T00:00:00.000Z', nextReview: '2026-07-01T00:00:00.000Z' },
      { flashcardId: 'b', rating: 'hard', reviewedAt: '2026-06-30T00:01:00.000Z', nextReview: '2026-07-02T00:00:00.000Z' },
      { flashcardId: 'c', rating: 'good', reviewedAt: '2026-06-30T00:02:00.000Z', nextReview: '2026-07-04T00:00:00.000Z' },
      { flashcardId: 'd', rating: 'easy', reviewedAt: '2026-06-30T00:03:00.000Z', nextReview: '2026-07-10T00:00:00.000Z' },
    ])

    expect(summary.reviewedCount).toBe(4)
    expect(summary.ratingCounts).toEqual({ again: 1, hard: 1, good: 1, easy: 1 })
    expect(summary.retentionPercent).toBe(50)
    expect(summary.againRatePercent).toBe(25)
    expect(summary.nextDueAt).toBe('2026-07-01T00:00:00.000Z')
    expect(summary.difficultFlashcardIds).toEqual(['a', 'b'])
  })

  it('handles an empty session safely', () => {
    const summary = summarizeFlashcardSession([])

    expect(summary.reviewedCount).toBe(0)
    expect(summary.retentionPercent).toBe(0)
    expect(summary.againRatePercent).toBe(0)
    expect(summary.difficultFlashcardIds).toEqual([])
  })

  it('finds due flashcards using UTC calendar-day comparison', () => {
    const due = findDueFlashcards([
      { ...academyCourses[0].modules[0].lessons[0].flashcards[0], id: 'due', nextReview: '2026-06-30T23:59:59.000Z' },
      { ...academyCourses[0].modules[0].lessons[0].flashcards[0], id: 'future', nextReview: '2026-07-01T00:00:00.000Z' },
    ], '2026-06-30T01:00:00.000Z')

    expect(due.map((card) => card.id)).toEqual(['due'])
  })
})
