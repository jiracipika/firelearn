import type { Flashcard } from '@/types/learning'

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type LearnerState = {
  completedLessonIds: string[]
  dailyGoalMinutes: number
  xp: number
  streakDays: number
}

export type QuizAttempt = {
  quizId: string
  scorePercent: number
  weakTopicIds: string[]
  completedAt: string
}

const learnerStateKey = 'firelearn.learnerState.v1'
const quizHistoryKey = 'firelearn.quizHistory.v1'
const flashcardsKey = 'firelearn.flashcards.v1'
const learnerNameKey = 'firelearn.learnerName.v1'

const defaultLearnerState: LearnerState = {
  completedLessonIds: [],
  dailyGoalMinutes: 25,
  xp: 0,
  streakDays: 0,
}

export function createMemoryStorage(): StorageLike {
  const store = new Map<string, string>()
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  }
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function loadLearnerState(storage: StorageLike): LearnerState {
  return safeParse(storage.getItem(learnerStateKey), defaultLearnerState)
}

export function saveLearnerState(storage: StorageLike, state: LearnerState) {
  storage.setItem(learnerStateKey, JSON.stringify(state))
}

export function loadQuizHistory(storage: StorageLike): QuizAttempt[] {
  return safeParse(storage.getItem(quizHistoryKey), [])
}

export function recordQuizResult(storage: StorageLike, attempt: QuizAttempt) {
  storage.setItem(quizHistoryKey, JSON.stringify([...loadQuizHistory(storage), attempt]))
}

export function loadFlashcards(storage: StorageLike): Record<string, Flashcard> {
  return safeParse(storage.getItem(flashcardsKey), {})
}

export function saveFlashcards(storage: StorageLike, cards: Flashcard[]) {
  const byId = cards.reduce<Record<string, Flashcard>>((accumulator, card) => {
    accumulator[card.id] = card
    return accumulator
  }, {})
  storage.setItem(flashcardsKey, JSON.stringify(byId))
}

export function getBrowserStorage(): StorageLike | undefined {
  if (typeof window === 'undefined') return undefined
  return window.localStorage
}

const MAX_NAME_LENGTH = 80

/**
 * Loads the learner's display name for certificate personalization.
 * Returns null when no name has been saved yet.
 */
export function loadLearnerName(storage: StorageLike): string | null {
  const raw = storage.getItem(learnerNameKey)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'string') return sanitizeName(parsed)
  } catch {
    // fall through to return null
  }
  return null
}

/**
 * Saves the learner's display name for use on completion certificates.
 * Empty or whitespace-only input clears the stored name.
 */
export function saveLearnerName(storage: StorageLike, name: string) {
  const clean = sanitizeName(name)
  if (!clean) {
    storage.removeItem(learnerNameKey)
    return
  }
  storage.setItem(learnerNameKey, JSON.stringify(clean))
}

function sanitizeName(name: string): string {
  return name.trim().slice(0, MAX_NAME_LENGTH)
}
