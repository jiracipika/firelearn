'use client'

import * as React from 'react'
import { getBrowserStorage } from '@/services/local-persistence'
import { loadStudyActivity, minutesStudiedToday, recordStudyActivity, streakDays, weeklyMinutes } from '@/services/study-activity'

export function useStudyActivity() {
  const [activity, setActivity] = React.useState(() => [] as ReturnType<typeof loadStudyActivity>)

  const refresh = React.useCallback(() => {
    const storage = getBrowserStorage()
    if (!storage) return
    setActivity(loadStudyActivity(storage))
  }, [])

  React.useEffect(() => {
    window.queueMicrotask(refresh)
  }, [refresh])

  const record = React.useCallback((entry: Parameters<typeof recordStudyActivity>[1]) => {
    const storage = getBrowserStorage()
    if (!storage) return
    recordStudyActivity(storage, entry)
    refresh()
  }, [refresh])

  return {
    activity,
    weeklyMinutes: weeklyMinutes(activity),
    minutesToday: minutesStudiedToday(activity),
    streakDays: streakDays(activity),
    record,
    refresh,
  }
}
