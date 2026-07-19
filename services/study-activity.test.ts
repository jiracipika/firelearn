import { describe, expect, it, vi } from 'vitest'
import { createMemoryStorage } from '@/services/local-persistence'
import type { StudyActivityEntry } from '@/services/study-activity'
import {
  loadStudyActivity,
  minutesStudiedToday,
  recordStudyActivity,
  streakDays,
  weeklyActivityDayLabels,
  weeklyMinutes,
} from '@/services/study-activity'

describe('study activity', () => {
  it('records and summarizes weekly minutes', () => {
    vi.setSystemTime(new Date('2026-06-30T12:00:00.000Z'))
    const storage = createMemoryStorage()
    recordStudyActivity(storage, { kind: 'study_timer', minutes: 10, createdAt: '2026-06-30T10:00:00.000Z' })
    recordStudyActivity(storage, { kind: 'quiz_complete', minutes: 5, createdAt: '2026-06-29T10:00:00.000Z' })

    const activity = loadStudyActivity(storage)
    expect(minutesStudiedToday(activity, new Date('2026-06-30T12:00:00.000Z'))).toBe(10)
    expect(weeklyMinutes(activity, new Date('2026-06-30T12:00:00.000Z'))).toEqual([0, 0, 0, 0, 0, 5, 10])
    expect(streakDays(activity, new Date('2026-06-30T12:00:00.000Z'))).toBe(2)
    vi.useRealTimers()
  })
})

describe('streakDays grace window', () => {
  // The streak should not break at midnight: if yesterday was active but the
  // learner has not yet done anything today, the streak is "at risk" but still
  // alive. It only breaks once a full calendar day is missed.
  it('preserves the streak when yesterday was active but today is empty', () => {
    const now = new Date('2026-07-02T08:00:00.000Z') // Thursday morning
    const activity: StudyActivityEntry[] = [
      { id: '1', kind: 'study_timer', minutes: 10, createdAt: '2026-06-30T10:00:00.000Z' },
      { id: '2', kind: 'quiz_complete', minutes: 5, createdAt: '2026-07-01T18:00:00.000Z' },
    ]

    expect(streakDays(activity, now)).toBe(2)
  })

  it('counts a 6-day streak before today\'s first rep', () => {
    const now = new Date('2026-07-07T07:00:00.000Z')
    // Activity on each of the previous 6 days, none yet today.
    const activity = Array.from({ length: 6 }, (_, index) => ({
      id: `e${index}`,
      kind: 'study_timer' as const,
      minutes: 15,
      createdAt: new Date(Date.UTC(2026, 6, index + 1, 10, 0, 0)).toISOString(),
    }))

    expect(streakDays(activity, now)).toBe(6)
  })

  it('breaks to zero once a full day is missed', () => {
    const now = new Date('2026-07-03T12:00:00.000Z')
    // Last activity was 2026-07-01; 2026-07-02 had nothing, so the chain broke.
    const activity: StudyActivityEntry[] = [
      { id: '1', kind: 'study_timer', minutes: 10, createdAt: '2026-07-01T10:00:00.000Z' },
    ]

    expect(streakDays(activity, now)).toBe(0)
  })

  it('does not over-count: a two-day gap breaks the streak even with older activity', () => {
    const now = new Date('2026-07-10T12:00:00.000Z')
    // Streak on Jul 1-5, but then nothing on Jul 6-9. Even with today's rep,
    // the chain is broken — today is the first active day again.
    const activity: StudyActivityEntry[] = [
      ...Array.from({ length: 5 }, (_, index) => ({
        id: `old-${index}`,
        kind: 'study_timer' as const,
        minutes: 10,
        createdAt: new Date(Date.UTC(2026, 6, index + 1, 10, 0, 0)).toISOString(),
      })),
      { id: 'today', kind: 'study_timer', minutes: 20, createdAt: '2026-07-10T09:00:00.000Z' },
    ]

    expect(streakDays(activity, now)).toBe(1)
  })
})

describe('weeklyActivityDayLabels', () => {
  it('labels a trailing 7-day window oldest-first with today last', () => {
    // 2026-06-30 is a Tuesday. Trailing 7 days oldest-first is therefore
    // Wed..Tue, ending on today. A constant ['Mon'..'Sun'] array would
    // mislabel every bar; this helper must reflect real weekdays.
    const labels = weeklyActivityDayLabels(new Date('2026-06-30T12:00:00.000Z'))

    expect(labels.map((entry) => entry.label)).toEqual(['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'])
    expect(labels.at(-1)?.isToday).toBe(true)
    expect(labels.slice(0, 6).every((entry) => entry.isToday === false)).toBe(true)
  })

  it('handles Sunday and week boundaries without wrapping errors', () => {
    // 2026-07-05 is a Sunday; window should end on Sun and start on Mon.
    const labels = weeklyActivityDayLabels(new Date('2026-07-05T12:00:00.000Z'))

    expect(labels.map((entry) => entry.label)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    expect(labels.filter((entry) => entry.isToday)).toHaveLength(1)
  })

  it('always returns seven entries for any date', () => {
    for (const iso of ['2026-01-01T00:00:00.000Z', '2026-07-18T00:00:00.000Z', '2026-12-31T00:00:00.000Z']) {
      expect(weeklyActivityDayLabels(new Date(iso))).toHaveLength(7)
    }
  })
})
