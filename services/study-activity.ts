import type { StorageLike } from '@/services/local-persistence'

export type StudyActivityEntry = {
  id: string
  kind: 'lesson_view' | 'lesson_complete' | 'quiz_complete' | 'flashcard_review' | 'study_timer'
  minutes: number
  createdAt: string
  entityId?: string
}

const studyActivityKey = 'firelearn.studyActivity.v1'

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function loadStudyActivity(storage: StorageLike): StudyActivityEntry[] {
  return safeParse(storage.getItem(studyActivityKey), [])
}

export function recordStudyActivity(storage: StorageLike, entry: Omit<StudyActivityEntry, 'id' | 'createdAt'> & { createdAt?: string }) {
  const createdAt = entry.createdAt ?? new Date().toISOString()
  const nextEntry: StudyActivityEntry = {
    ...entry,
    id: `${entry.kind}-${createdAt}-${Math.random().toString(36).slice(2)}`,
    createdAt,
  }
  storage.setItem(studyActivityKey, JSON.stringify([...loadStudyActivity(storage), nextEntry].slice(-500)))
  return nextEntry
}

const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function dayKey(value: Date) {
  return value.toISOString().slice(0, 10)
}

function daysAgo(days: number, now = new Date()) {
  const date = new Date(now)
  date.setUTCDate(date.getUTCDate() - days)
  return dayKey(date)
}

/**
 * Day-of-week short labels (e.g. "Mon") for the seven entries returned by
 * `weeklyMinutes`, oldest first (index 0 = 6 days ago, index 6 = today).
 *
 * `weeklyMinutes` is a trailing-7-day window, not a fixed Mon–Sun week, so
 * pairing its values with a constant `['Mon', ... 'Sun']` array mislabels
 * every bar except on Sundays. This helper keeps the labels aligned with the
 * same UTC date math used by `daysAgo` / `weeklyMinutes`, and marks the
 * current day so the UI can highlight it without recomputing the date.
 */
export function weeklyActivityDayLabels(
  now: Date = new Date(),
): ReadonlyArray<{ label: string; isToday: boolean }> {
  return Array.from({ length: 7 }, (_, index) => {
    const daysBack = 6 - index
    const date = new Date(now)
    date.setUTCDate(date.getUTCDate() - daysBack)
    return {
      label: SHORT_DAY_NAMES[date.getUTCDay()],
      isToday: daysBack === 0,
    }
  })
}

export function weeklyMinutes(activity: StudyActivityEntry[], now = new Date()) {
  const byDay = new Map<string, number>()
  activity.forEach((entry) => {
    const key = dayKey(new Date(entry.createdAt))
    byDay.set(key, (byDay.get(key) ?? 0) + Math.max(0, Math.round(entry.minutes)))
  })
  return Array.from({ length: 7 }, (_, index) => byDay.get(daysAgo(6 - index, now)) ?? 0)
}

export function minutesStudiedToday(activity: StudyActivityEntry[], now = new Date()) {
  const today = dayKey(now)
  return activity
    .filter((entry) => dayKey(new Date(entry.createdAt)) === today)
    .reduce((sum, entry) => sum + Math.max(0, Math.round(entry.minutes)), 0)
}

export function streakDays(activity: StudyActivityEntry[], now = new Date()) {
  const activeDays = new Set(
    activity.filter((entry) => entry.minutes > 0).map((entry) => dayKey(new Date(entry.createdAt))),
  )

  // Today does not count as a broken streak until the day actually ends: if
  // there is no activity yet today but yesterday was active, the streak is
  // "at risk" but not lost. We start counting from the most recent active day
  // that is today or yesterday; anything older means the chain already broke.
  // Without this grace, a learner who studied every day this week would see
  // their streak reset to 0 the moment they open the app before studying.
  const startOffset = activeDays.has(daysAgo(0, now))
    ? 0
    : activeDays.has(daysAgo(1, now))
      ? 1
      : -1

  if (startOffset === -1) return 0

  let streak = 0
  while (activeDays.has(daysAgo(startOffset + streak, now))) streak += 1
  return streak
}

export function exportLocalFireLearnData(storage: StorageLike) {
  const keys = [
    'firelearn.learnerState.v1',
    'firelearn.quizHistory.v1',
    'firelearn.flashcards.v1',
    'firelearn.syncQueue.v1',
    'firelearn.studyTimer.v1',
    studyActivityKey,
  ]
  return keys.reduce<Record<string, unknown>>((data, key) => {
    data[key] = safeParse(storage.getItem(key), null)
    return data
  }, { exportedAt: new Date().toISOString() })
}
