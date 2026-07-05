import { describe, expect, it } from 'vitest'
import type { QuizAttempt } from '@/services/local-persistence'
import {
  QUIZ_PASS_THRESHOLD_PERCENT,
  summarizeQuizHistory,
} from '@/services/quiz-history-summary'

function attempt(quizId: string, scorePercent: number, completedAt = '2026-07-01T00:00:00.000Z'): QuizAttempt {
  return { quizId, scorePercent, weakTopicIds: [], completedAt }
}

// Helper: build a history of N attempts with descending timestamps and the
// given scores. Index 0 is the newest attempt (matching mergeQuizHistory order).
function history(scores: number[]): QuizAttempt[] {
  return scores.map((score, index) =>
    attempt(`quiz-${index}`, score, new Date(Date.UTC(2026, 6, index + 1)).toISOString()),
  )
}

describe('summarizeQuizHistory', () => {
  it('returns safe zeros for an empty history', () => {
    const summary = summarizeQuizHistory([])

    expect(summary).toMatchObject({
      totalAttempts: 0,
      averageScorePercent: 0,
      bestScorePercent: 0,
      passRatePercent: 0,
      perfectCount: 0,
      trend: 'insufficient',
    })
  })

  it('computes average, best, and total across attempts', () => {
    const summary = summarizeQuizHistory(history([90, 70, 50]))

    expect(summary.totalAttempts).toBe(3)
    expect(summary.averageScorePercent).toBe(Math.round((90 + 70 + 50) / 3))
    expect(summary.bestScorePercent).toBe(90)
  })

  it('reports the pass rate against the 70 percent threshold', () => {
    const summary = summarizeQuizHistory(history([100, 80, 69, 40]))

    // 2 of 4 attempts pass the QUIZ_PASS_THRESHOLD_PERCENT.
    expect(summary.passRatePercent).toBe(50)
    expect(QUIZ_PASS_THRESHOLD_PERCENT).toBe(70)
  })

  it('counts perfect-score attempts separately from passes', () => {
    const summary = summarizeQuizHistory(history([100, 100, 85, 70]))

    expect(summary.perfectCount).toBe(2)
  })

  it('averages only the most recent attempts for the recent signal', () => {
    const summary = summarizeQuizHistory(history([100, 90, 80, 70, 60, 20, 10]))

    // Recent window is 5 newest: [100, 90, 80, 70, 60] → mean 80.
    expect(summary.recentAverageScorePercent).toBe(80)
  })

  it('flags an improving trend when recent average is meaningfully higher', () => {
    const summary = summarizeQuizHistory(history([100, 95, 90, 85, 80, 50, 40, 30]))

    expect(summary.trend).toBe('improving')
    expect(summary.trendDelta).toBeGreaterThan(0)
  })

  it('flags a declining trend when recent average is meaningfully lower', () => {
    const summary = summarizeQuizHistory(history([30, 40, 50, 55, 45, 90, 85, 80]))

    expect(summary.trend).toBe('declining')
    expect(summary.trendDelta).toBeLessThan(0)
  })

  it('reports steady when the recent average is within the dead zone', () => {
    // Recent [80, 78, 82, 79, 81] mean 80, baseline [76, 84, 80] mean 80 → steady.
    const summary = summarizeQuizHistory(history([80, 78, 82, 79, 81, 76, 84, 80]))

    expect(summary.trend).toBe('steady')
  })

  it('reports insufficient when there are not enough samples to judge direction', () => {
    const summary = summarizeQuizHistory(history([90, 80]))

    expect(summary.trend).toBe('insufficient')
  })

  it('reports insufficient when all attempts fall inside the recent window', () => {
    const summary = summarizeQuizHistory(history([100, 90, 80, 70, 60]))

    // No baseline to compare against → insufficient even with 5 samples.
    expect(summary.trend).toBe('insufficient')
  })
})
