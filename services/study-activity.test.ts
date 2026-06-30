import { describe, expect, it, vi } from 'vitest'
import { createMemoryStorage } from '@/services/local-persistence'
import { loadStudyActivity, minutesStudiedToday, recordStudyActivity, streakDays, weeklyMinutes } from '@/services/study-activity'

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
