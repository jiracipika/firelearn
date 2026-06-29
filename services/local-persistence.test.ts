import { describe, expect, it } from 'vitest'
import type { Flashcard } from '@/types/learning'
import {
  createMemoryStorage,
  loadFlashcards,
  loadLearnerState,
  loadQuizHistory,
  recordQuizResult,
  saveFlashcards,
  saveLearnerState,
} from '@/services/local-persistence'

const sampleCard: Flashcard = {
  id: 'card-1',
  front: 'What is a Mayday?',
  back: 'An emergency radio transmission for firefighter distress.',
  topicIds: ['mayday-procedures'],
  difficulty: 'Firefighter I',
  easeFactor: 2.5,
  intervalDays: 0,
  nextReview: '2026-06-28T00:00:00.000Z',
  reviewCount: 0,
}

describe('local persistence', () => {
  it('stores and restores learner state with safe defaults', () => {
    const storage = createMemoryStorage()

    expect(loadLearnerState(storage)).toEqual({
      completedLessonIds: [],
      dailyGoalMinutes: 25,
      xp: 0,
      streakDays: 0,
    })

    saveLearnerState(storage, {
      completedLessonIds: ['lesson-1'],
      dailyGoalMinutes: 30,
      xp: 120,
      streakDays: 4,
    })

    expect(loadLearnerState(storage)).toEqual({
      completedLessonIds: ['lesson-1'],
      dailyGoalMinutes: 30,
      xp: 120,
      streakDays: 4,
    })
  })

  it('appends quiz attempts without losing history', () => {
    const storage = createMemoryStorage()

    recordQuizResult(storage, { quizId: 'quiz-1', scorePercent: 80, weakTopicIds: ['scba'], completedAt: '2026-06-28T00:00:00.000Z' })
    recordQuizResult(storage, { quizId: 'quiz-1', scorePercent: 100, weakTopicIds: [], completedAt: '2026-06-29T00:00:00.000Z' })

    expect(loadQuizHistory(storage)).toHaveLength(2)
    expect(loadQuizHistory(storage)[1]?.scorePercent).toBe(100)
  })

  it('persists scheduled flashcards by card id', () => {
    const storage = createMemoryStorage()
    const scheduled = { ...sampleCard, intervalDays: 4, reviewCount: 2 }

    saveFlashcards(storage, [scheduled])

    expect(loadFlashcards(storage)).toEqual({ 'card-1': scheduled })
  })

  it('recovers from malformed stored JSON instead of throwing', () => {
    const storage = createMemoryStorage()
    storage.setItem('firelearn.quizHistory.v1', '{bad json')

    expect(loadQuizHistory(storage)).toEqual([])
  })
})
