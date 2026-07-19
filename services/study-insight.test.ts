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

  it('warns when a multi-day streak is at risk because today is empty', () => {
    // The grace window in streakDays() keeps a streak alive across midnight, so
    // a learner with activity on previous days but none yet today still sees a
    // streak number. The insight should turn that preserved number into an
    // explicit "extend it before midnight" nudge rather than a silent pass.
    const insight = getWeeklyStudyInsight({ weeklyMinutes: [20, 25, 0, 15, 30, 10, 0], dailyGoalMinutes: 30, streakDays: 3 })

    expect(insight.status).toBe('catch-up')
    expect(insight.title).toContain('streak is on the line')
    expect(insight.metricLabel).toBe('streak to extend')
    expect(insight.metricValue).toBe('3 days')
    expect(insight.summary).toContain('3-day streak')
  })

  it('does not raise a streak-at-risk warning for a single-day streak', () => {
    // A 1-day "streak" is just yesterday's activity — there is no meaningful
    // chain to protect yet, so we fall through to the normal remaining-minutes
    // guidance instead of an alarming at-risk message.
    const insight = getWeeklyStudyInsight({ weeklyMinutes: [0, 0, 0, 0, 0, 20, 0], dailyGoalMinutes: 30, streakDays: 1 })

    expect(insight.status).toBe('catch-up')
    expect(insight.metricLabel).toBe('left today')
  })
})
