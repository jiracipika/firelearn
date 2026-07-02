import { describe, expect, it } from 'vitest'
import { getWeeklyStudyInsight } from '@/services/study-insight'

describe('getWeeklyStudyInsight', () => {
  it('nudges inactive learners into a short first rep', () => {
    const insight = getWeeklyStudyInsight({ weeklyMinutes: [0, 0, 0, 0, 0, 0, 0], dailyGoalMinutes: 30, streakDays: 0 })

    expect(insight.status).toBe('start')
    expect(insight.metricValue).toBe('10 min')
  })

  it('calculates the remaining minutes needed today', () => {
    const insight = getWeeklyStudyInsight({ weeklyMinutes: [0, 15, 0, 20, 0, 5, 18], dailyGoalMinutes: 30, streakDays: 1 })

    expect(insight.status).toBe('catch-up')
    expect(insight.metricLabel).toBe('left today')
    expect(insight.metricValue).toBe('12 min')
    expect(insight.summary).toContain('4 active days')
  })

  it('recognizes strong weekly consistency', () => {
    const insight = getWeeklyStudyInsight({ weeklyMinutes: [30, 35, 40, 30, 45, 30, 30], dailyGoalMinutes: 30, streakDays: 7 })

    expect(insight.status).toBe('strong')
    expect(insight.metricValue).toBe('240 min')
  })
})
