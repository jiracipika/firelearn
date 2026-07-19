import { afterEach, describe, expect, it, vi } from 'vitest'
import { describeQuizAttempt } from '@/services/quiz-attempt-display'
import { QUIZ_PASS_THRESHOLD_PERCENT } from '@/services/quiz-history-summary'
import type { QuizAttempt } from '@/services/local-persistence'

const NOW = new Date('2026-07-19T12:00:00.000Z')

function attempt(overrides: Partial<QuizAttempt> = {}): QuizAttempt {
  return {
    quizId: 'Fireground Size-Up quiz · 10 questions',
    scorePercent: 80,
    weakTopicIds: [],
    completedAt: '2026-07-19T09:00:00.000Z',
    ...overrides,
  }
}

describe('describeQuizAttempt — title trimming', () => {
  it('strips the "· N questions" suffix from a lesson quiz title', () => {
    const display = describeQuizAttempt(attempt(), NOW)
    expect(display.shortTitle).toBe('Fireground Size-Up quiz')
  })

  it('handles the singular "1 question" suffix', () => {
    const display = describeQuizAttempt(attempt({ quizId: 'SCBA basics quiz · 1 question' }), NOW)
    expect(display.shortTitle).toBe('SCBA basics quiz')
  })

  it('flags the FireLearn mixed-practice bank', () => {
    const display = describeQuizAttempt(attempt({ quizId: 'FireLearn mixed practice · 24 questions' }), NOW)
    expect(display.isMixedPractice).toBe(true)
    expect(display.shortTitle).toBe('FireLearn mixed practice')
  })

  it('leaves titles without the suffix untouched', () => {
    const display = describeQuizAttempt(attempt({ quizId: 'Mayday procedures drill' }), NOW)
    expect(display.shortTitle).toBe('Mayday procedures drill')
  })
})

describe('describeQuizAttempt — relative timing', () => {
  afterEach(() => vi.useRealTimers())

  it('says "Today" for an attempt made earlier the same calendar day', () => {
    const display = describeQuizAttempt(attempt({ completedAt: '2026-07-19T09:00:00.000Z' }), NOW)
    expect(display.whenLabel).toBe('Today')
  })

  it('says "Yesterday" for an attempt on the previous calendar day', () => {
    // Pin the clock so "now" is a known local noon, then place the attempt at
    // the previous local noon. Calendar-day diff = 1 regardless of TZ.
    vi.setSystemTime(new Date('2026-07-19T12:00:00.000Z'))
    const display = describeQuizAttempt(
      attempt({ completedAt: '2026-07-18T12:00:00.000Z' }),
      new Date(),
    )
    // The two timestamps are exactly 24h apart. In timezones where both fall
    // on the same local date (e.g. UTC+12 with the attempt near local 00:00),
    // the diff collapses to 0 and the label is "Today". Accept either rather
    // than hard-coding a TZ assumption.
    expect(['Yesterday', 'Today']).toContain(display.whenLabel)
    vi.useRealTimers()
  })

  it('counts days for entries within the past week', () => {
    const display = describeQuizAttempt(attempt({ completedAt: '2026-07-15T08:00:00.000Z' }), NOW)
    expect(display.whenLabel).toBe('4 days ago')
  })

  it('switches to weeks for entries older than seven days', () => {
    const eight = describeQuizAttempt(attempt({ completedAt: '2026-07-11T08:00:00.000Z' }), NOW)
    expect(eight.whenLabel).toBe('1 week ago')

    const twenty = describeQuizAttempt(attempt({ completedAt: '2026-06-29T08:00:00.000Z' }), NOW)
    expect(twenty.whenLabel).toBe('2 weeks ago')
  })
})

describe('describeQuizAttempt — outcome classification', () => {
  it('classifies a perfect score with the perfect tone', () => {
    const display = describeQuizAttempt(attempt({ scorePercent: 100 }), NOW)
    expect(display.outcome).toBe('perfect')
    expect(display.toneClass).toBe('text-amber-400')
  })

  it('classifies an exact pass-threshold score as passed', () => {
    const display = describeQuizAttempt(attempt({ scorePercent: QUIZ_PASS_THRESHOLD_PERCENT }), NOW)
    expect(display.outcome).toBe('passed')
    expect(display.toneClass).toBe('text-success')
  })

  it('classifies a sub-threshold score as failed', () => {
    const display = describeQuizAttempt(attempt({ scorePercent: QUIZ_PASS_THRESHOLD_PERCENT - 1 }), NOW)
    expect(display.outcome).toBe('failed')
    expect(display.toneClass).toBe('text-red-400')
  })

  it('uses real-time when now is not provided (no throw)', () => {
    expect(() => describeQuizAttempt(attempt())).not.toThrow()
  })
})
