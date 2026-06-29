import { describe, expect, it } from 'vitest'
import type { Flashcard } from '@/types/learning'
import { buildReviewQueue, cardStage, isOverdue, scheduleReview } from '@/services/spaced-repetition'

const baseCard: Flashcard = {
  id: 'card-1',
  front: 'Front',
  back: 'Back',
  topicIds: ['fire-behaviour'],
  difficulty: 'Firefighter I',
  easeFactor: 2.5,
  intervalDays: 1,
  nextReview: '2026-06-28T00:00:00.000Z',
  reviewCount: 1,
}

describe('spaced repetition', () => {
  it('schedules again reviews for later today and lowers ease', () => {
    const reviewed = scheduleReview(baseCard, 'again', new Date('2026-06-28T12:00:00.000Z'))

    expect(reviewed.intervalDays).toBe(0)
    expect(reviewed.easeFactor).toBeLessThan(baseCard.easeFactor)
    expect(reviewed.reviewCount).toBe(2)
  })

  it('schedules easy cards farther out than good cards', () => {
    const reviewedAt = new Date('2026-06-28T12:00:00.000Z')

    expect(scheduleReview(baseCard, 'easy', reviewedAt).intervalDays).toBeGreaterThan(scheduleReview(baseCard, 'good', reviewedAt).intervalDays)
  })

  it('classifies new, learning, and mature stages', () => {
    expect(cardStage({ ...baseCard, reviewCount: 0, intervalDays: 0 })).toBe('new')
    expect(cardStage({ ...baseCard, reviewCount: 2, intervalDays: 3 })).toBe('learning')
    expect(cardStage({ ...baseCard, reviewCount: 6, intervalDays: 14 })).toBe('mature')
  })

  it('builds due and overdue queues', () => {
    const now = new Date('2026-06-28T12:00:00.000Z')
    const overdue = { ...baseCard, id: 'overdue', nextReview: '2026-06-27T00:00:00.000Z' }
    const dueToday = { ...baseCard, id: 'due', nextReview: '2026-06-28T00:00:00.000Z' }
    const queue = buildReviewQueue([overdue, dueToday], now)

    expect(isOverdue(overdue, now)).toBe(true)
    expect(queue.overdue).toHaveLength(1)
    expect(queue.dueToday).toHaveLength(1)
  })
})
