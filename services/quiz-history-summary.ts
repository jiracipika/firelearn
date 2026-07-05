import type { QuizAttempt } from '@/services/local-persistence'

export const QUIZ_PASS_THRESHOLD_PERCENT = 70
export const PERFECT_SCORE_PERCENT = 100
const RECENT_WINDOW = 5
const TREND_MIN_SAMPLES = 4

export type QuizHistoryTrend = 'improving' | 'declining' | 'steady' | 'insufficient'

export type QuizHistorySummary = {
  totalAttempts: number
  averageScorePercent: number
  bestScorePercent: number
  passRatePercent: number
  perfectCount: number
  recentAverageScorePercent: number
  trend: QuizHistoryTrend
  trendDelta: number
}

const emptySummary: QuizHistorySummary = {
  totalAttempts: 0,
  averageScorePercent: 0,
  bestScorePercent: 0,
  passRatePercent: 0,
  perfectCount: 0,
  recentAverageScorePercent: 0,
  trend: 'insufficient',
  trendDelta: 0,
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

/**
 * Compute aggregate performance metrics from a learner's quiz attempt history.
 *
 * Attempts are expected newest-first (the order produced by the merge helpers
 * in `services/progress-merge.ts`). The trend compares the average of the
 * most recent attempts against the average of the attempts before them so it
 * reflects direction-of-travel rather than overall volatility.
 */
export function summarizeQuizHistory(attempts: QuizAttempt[]): QuizHistorySummary {
  if (attempts.length === 0) return { ...emptySummary }

  const scores = attempts.map((attempt) => attempt.scorePercent)
  const totalAttempts = attempts.length
  const averageScorePercent = mean(scores)
  const bestScorePercent = Math.max(...scores)
  const passRatePercent = Math.round(
    (scores.filter((score) => score >= QUIZ_PASS_THRESHOLD_PERCENT).length / totalAttempts) * 100,
  )
  const perfectCount = scores.filter((score) => score === PERFECT_SCORE_PERCENT).length

  const recent = scores.slice(0, RECENT_WINDOW)
  const recentAverageScorePercent = mean(recent)

  const baseline = scores.slice(RECENT_WINDOW)
  const trend = computeTrend(recent, baseline)
  const trendDelta =
    baseline.length > 0 && recent.length > 0 ? recentAverageScorePercent - mean(baseline) : 0

  return {
    totalAttempts,
    averageScorePercent,
    bestScorePercent,
    passRatePercent,
    perfectCount,
    recentAverageScorePercent,
    trend,
    trendDelta,
  }
}

function computeTrend(recent: number[], baseline: number[]): QuizHistoryTrend {
  const combinedSamples = recent.length + baseline.length
  if (combinedSamples < TREND_MIN_SAMPLES || baseline.length === 0 || recent.length === 0) {
    return 'insufficient'
  }

  const delta = mean(recent) - mean(baseline)
  // 5-point dead zone keeps small fluctuations from flickering the label.
  if (delta > 5) return 'improving'
  if (delta < -5) return 'declining'
  return 'steady'
}
