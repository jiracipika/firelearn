import { describe, expect, it, vi } from 'vitest'
import { createMemoryStorage } from '@/services/local-persistence'
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
