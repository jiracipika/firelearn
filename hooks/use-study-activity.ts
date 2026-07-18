'use client'

import * as React from 'react'
import { getBrowserStorage } from '@/services/local-persistence'
import {
  loadStudyActivity,
  minutesStudiedToday,
  recordStudyActivity,
  streakDays,
  weeklyActivityDayLabels,
  weeklyMinutes,
} from '@/services/study-activity'

export type StudyActivityDayLabel = { label: string; isToday: boolean }

export function useStudyActivity() {
  const [activity, setActivity] = React.useState(() => [] as ReturnType<typeof loadStudyActivity>)
  // Render an empty array on the first client pass so the markup matches the
  // server (which has no `now`). Populate after mount from the real clock so
  // the heatmap never mismatches between SSR and hydration.
  const [dayLabels, setDayLabels] = React.useState<StudyActivityDayLabel[]>([])

  const refresh = React.useCallback(() => {
    const storage = getBrowserStorage()
    if (!storage) return
    setActivity(loadStudyActivity(storage))
    setDayLabels(weeklyActivityDayLabels().slice())
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
    dayLabels,
    record,
    refresh,
  }
}
