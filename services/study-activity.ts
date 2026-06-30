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

function dayKey(value: Date) {
  return value.toISOString().slice(0, 10)
}

function daysAgo(days: number, now = new Date()) {
  const date = new Date(now)
  date.setUTCDate(date.getUTCDate() - days)
  return dayKey(date)
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
  const activeDays = new Set(activity.filter((entry) => entry.minutes > 0).map((entry) => dayKey(new Date(entry.createdAt))))
  let streak = 0
  while (activeDays.has(daysAgo(streak, now))) streak += 1
  return streak
}

export function exportLocalFireLearnData(storage: StorageLike) {
  const keys = [
    'firelearn.learnerState.v1',
    'firelearn.quizHistory.v1',
    'firelearn.flashcards.v1',
    'firelearn.syncQueue.v1',
    studyActivityKey,
  ]
  return keys.reduce<Record<string, unknown>>((data, key) => {
    data[key] = safeParse(storage.getItem(key), null)
    return data
  }, { exportedAt: new Date().toISOString() })
}
