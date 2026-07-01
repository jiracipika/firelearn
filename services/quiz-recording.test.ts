import { describe, expect, it } from 'vitest'
import { createMemoryStorage, loadQuizHistory } from '@/services/local-persistence'
import { loadStudyActivity } from '@/services/study-activity'
import { recordQuizOutcome } from '@/services/quiz-recording'
import type { QuizResult } from '@/services/quiz-engine'

function mockResult(overrides?: Partial<QuizResult>): QuizResult {
  return {
    totalQuestions: 10,
    correctAnswers: 7,
    scorePercent: 70,
    passed: true,
    weakTopicIds: ['scba'],
    answers: [],
    ...overrides,
  }
}

describe('quiz recording', () => {
  it('records the attempt to local persistence', () => {
    const storage = createMemoryStorage()
    const outcome = recordQuizOutcome(storage, {
      quizId: 'smoke-quiz',
      result: mockResult(),
      questionCount: 10,
      completedAt: '2026-06-30T12:00:00.000Z',
    })

    expect(outcome.recorded).toBe(true)
    expect(outcome.attempt.quizId).toBe('smoke-quiz')

    const history = loadQuizHistory(storage)
    expect(history).toHaveLength(1)
    expect(history[0].scorePercent).toBe(70)
    expect(history[0].weakTopicIds).toEqual(['scba'])
  })

  it('records study activity with estimated minutes', () => {
    const storage = createMemoryStorage()
    recordQuizOutcome(storage, {
      quizId: 'scba-quiz',
      result: mockResult({ scorePercent: 90 }),
      questionCount: 12,
      completedAt: '2026-06-30T12:00:00.000Z',
    })

    const activity = loadStudyActivity(storage)
    expect(activity).toHaveLength(1)
    expect(activity[0].kind).toBe('quiz_complete')
    expect(activity[0].minutes).toBe(9) // max(3, round(12 * 0.75))
  })

  it('handles zero-question quizzes safely', () => {
    const storage = createMemoryStorage()
    const outcome = recordQuizOutcome(storage, {
      quizId: 'empty-quiz',
      result: mockResult({ totalQuestions: 0, correctAnswers: 0, scorePercent: 0, passed: false }),
      questionCount: 0,
      completedAt: '2026-06-30T12:00:00.000Z',
    })

    expect(outcome.recorded).toBe(true)
    expect(outcome.attempt.scorePercent).toBe(0)
    // max(3, round(0 * 0.75)) = max(3, 0) = 3
    const activity = loadStudyActivity(storage)
    expect(activity[0].minutes).toBe(3)
  })
})
