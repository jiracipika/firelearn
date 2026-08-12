import type { StorageLike, LearnerState, QuizAttempt } from '@/services/local-persistence'
import type { SyncQueueItem } from '@/services/offline-progress'
import type { StudyActivityEntry } from '@/services/study-activity'
import type { StudyTimerSession } from '@/services/study-timer'
import type { Difficulty, Flashcard } from '@/types/learning'

export type ExportedData = {
  exportedAt?: string
  'firelearn.learnerState.v1'?: LearnerState | null
  'firelearn.quizHistory.v1'?: QuizAttempt[] | null
  'firelearn.flashcards.v1'?: Record<string, Flashcard> | null
  'firelearn.syncQueue.v1'?: SyncQueueItem[] | null
  'firelearn.studyActivity.v1'?: StudyActivityEntry[] | null
  'firelearn.studyTimer.v1'?: StudyTimerSession | null
}

export type ValidationResult = {
  valid: boolean
  errors: string[]
  data: ExportedData
}

const restorableKeys = [
  'firelearn.learnerState.v1',
  'firelearn.quizHistory.v1',
  'firelearn.flashcards.v1',
  'firelearn.syncQueue.v1',
  'firelearn.studyActivity.v1',
  'firelearn.studyTimer.v1',
] as const

const difficulties = new Set<Difficulty>(['Recruit', 'Firefighter I', 'Firefighter II', 'Company Officer', 'Advanced'])
const syncEntities = new Set(['lesson_completion', 'quiz_attempt', 'flashcard_review'])
const syncOperations = new Set(['upsert', 'insert', 'delete'])
const syncStatuses = new Set(['pending', 'synced', 'failed'])
const activityKinds = new Set(['lesson_view', 'lesson_complete', 'quiz_complete', 'flashcard_review', 'study_timer'])

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isNonNegativeNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

function validateLearnerState(value: unknown, errors: string[]): LearnerState | null {
  if (value === null || value === undefined) return null
  if (!isObject(value)) {
    errors.push('learnerState is not an object')
    return null
  }
  const required: (keyof LearnerState)[] = ['completedLessonIds', 'dailyGoalMinutes', 'xp', 'streakDays']
  for (const key of required) {
    if (!(key in value)) errors.push(`learnerState missing field: ${key}`)
  }
  if (!isNonNegativeNumber(value.streakDays)) errors.push('learnerState.streakDays must be a non-negative finite number')
  if (!isNonNegativeNumber(value.xp)) errors.push('learnerState.xp must be a non-negative finite number')
  if (!isNonNegativeNumber(value.dailyGoalMinutes)) errors.push('learnerState.dailyGoalMinutes must be a non-negative finite number')
  if (!isStringArray(value.completedLessonIds)) errors.push('learnerState.completedLessonIds must be an array of strings')
  return value as unknown as LearnerState
}

function validateQuizHistory(value: unknown, errors: string[]): QuizAttempt[] | null {
  if (value === null || value === undefined) return null
  if (!Array.isArray(value)) {
    errors.push('quizHistory is not an array')
    return null
  }
  value.forEach((entry, index) => {
    if (!isObject(entry)) {
      errors.push(`quizHistory[${index}] is not an object`)
      return
    }
    if (typeof entry.quizId !== 'string') errors.push(`quizHistory[${index}].quizId must be a string`)
    if (!isFiniteNumber(entry.scorePercent) || entry.scorePercent < 0 || entry.scorePercent > 100) errors.push(`quizHistory[${index}].scorePercent must be between 0 and 100`)
    if (!isValidDate(entry.completedAt)) errors.push(`quizHistory[${index}].completedAt must be a valid date`)
    if (!isStringArray(entry.weakTopicIds)) errors.push(`quizHistory[${index}].weakTopicIds must be an array of strings`)
  })
  return value as unknown as QuizAttempt[]
}

function validateFlashcards(value: unknown, errors: string[]): Record<string, Flashcard> | null {
  if (value === null || value === undefined) return null
  if (!isObject(value)) {
    errors.push('flashcards is not an object')
    return null
  }
  Object.entries(value).forEach(([key, card]) => {
    const path = `flashcards.${key}`
    if (!isObject(card)) {
      errors.push(`${path} is not an object`)
      return
    }
    if (card.id !== key) errors.push(`${path}.id must match its storage key`)
    if (typeof card.front !== 'string' || typeof card.back !== 'string') errors.push(`${path} front and back must be strings`)
    if (!isStringArray(card.topicIds)) errors.push(`${path}.topicIds must be an array of strings`)
    if (typeof card.difficulty !== 'string' || !difficulties.has(card.difficulty as Difficulty)) errors.push(`${path}.difficulty is invalid`)
    if (!isFiniteNumber(card.easeFactor) || card.easeFactor < 1.3) errors.push(`${path}.easeFactor must be at least 1.3`)
    if (!Number.isInteger(card.intervalDays) || (card.intervalDays as number) < 0) errors.push(`${path}.intervalDays must be a non-negative integer`)
    if (!Number.isInteger(card.reviewCount) || (card.reviewCount as number) < 0) errors.push(`${path}.reviewCount must be a non-negative integer`)
    if (!isValidDate(card.nextReview)) errors.push(`${path}.nextReview must be a valid date`)
    if (card.lastReviewed !== undefined && !isValidDate(card.lastReviewed)) errors.push(`${path}.lastReviewed must be a valid date`)
  })
  return value as Record<string, Flashcard>
}

function validateSyncQueue(value: unknown, errors: string[]): SyncQueueItem[] | null {
  if (value === null || value === undefined) return null
  if (!Array.isArray(value)) {
    errors.push('syncQueue is not an array')
    return null
  }
  const ids = new Set<string>()
  value.forEach((item, index) => {
    const path = `syncQueue[${index}]`
    if (!isObject(item)) {
      errors.push(`${path} is not an object`)
      return
    }
    if (typeof item.id !== 'string' || !item.id) errors.push(`${path}.id must be a non-empty string`)
    else if (ids.has(item.id)) errors.push(`${path}.id is duplicated`)
    else ids.add(item.id)
    if (typeof item.entity !== 'string' || !syncEntities.has(item.entity)) errors.push(`${path}.entity is invalid`)
    if (typeof item.operation !== 'string' || !syncOperations.has(item.operation)) errors.push(`${path}.operation is invalid`)
    if (typeof item.status !== 'string' || !syncStatuses.has(item.status)) errors.push(`${path}.status is invalid`)
    if (!isObject(item.payload)) errors.push(`${path}.payload must be an object`)
    if (!isValidDate(item.createdAt)) errors.push(`${path}.createdAt must be a valid date`)
  })
  return value as SyncQueueItem[]
}

function validateStudyActivity(value: unknown, errors: string[]): StudyActivityEntry[] | null {
  if (value === null || value === undefined) return null
  if (!Array.isArray(value)) {
    errors.push('studyActivity is not an array')
    return null
  }
  value.forEach((entry, index) => {
    if (!isObject(entry)) {
      errors.push(`studyActivity[${index}] is not an object`)
      return
    }
    if (typeof entry.id !== 'string' || !entry.id) errors.push(`studyActivity[${index}].id must be a non-empty string`)
    if (typeof entry.kind !== 'string' || !activityKinds.has(entry.kind)) errors.push(`studyActivity[${index}].kind is invalid: ${String(entry.kind)}`)
    if (!isNonNegativeNumber(entry.minutes)) errors.push(`studyActivity[${index}].minutes must be a non-negative finite number`)
    if (!isValidDate(entry.createdAt)) errors.push(`studyActivity[${index}].createdAt must be a valid date`)
    if (entry.entityId !== undefined && typeof entry.entityId !== 'string') errors.push(`studyActivity[${index}].entityId must be a string`)
  })
  return value as unknown as StudyActivityEntry[]
}

function validateStudyTimer(value: unknown, errors: string[]): StudyTimerSession | null {
  if (value === null || value === undefined) return null
  if (!isObject(value)) {
    errors.push('studyTimer is not an object')
    return null
  }
  if (value.startedAt !== null && !isNonNegativeNumber(value.startedAt)) errors.push('studyTimer.startedAt must be null or a non-negative finite number')
  if (!isNonNegativeNumber(value.accumulatedSeconds)) errors.push('studyTimer.accumulatedSeconds must be a non-negative finite number')
  return value as unknown as StudyTimerSession
}

export function validateExportedData(raw: unknown): ValidationResult {
  const errors: string[] = []
  if (!isObject(raw)) return { valid: false, errors: ['Export root is not an object'], data: {} }

  const data = raw as ExportedData
  validateLearnerState(data['firelearn.learnerState.v1'], errors)
  validateQuizHistory(data['firelearn.quizHistory.v1'], errors)
  validateFlashcards(data['firelearn.flashcards.v1'], errors)
  validateSyncQueue(data['firelearn.syncQueue.v1'], errors)
  validateStudyActivity(data['firelearn.studyActivity.v1'], errors)
  validateStudyTimer(data['firelearn.studyTimer.v1'], errors)
  return { valid: errors.length === 0, errors, data }
}

export function validateStorageIntegrity(storage: StorageLike): ValidationResult {
  function safeParse(key: string): unknown {
    const raw = storage.getItem(key)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return { __parseError: true }
    }
  }

  const exported: ExportedData = {
    exportedAt: new Date().toISOString(),
    'firelearn.learnerState.v1': safeParse('firelearn.learnerState.v1') as LearnerState | null,
    'firelearn.quizHistory.v1': safeParse('firelearn.quizHistory.v1') as QuizAttempt[] | null,
    'firelearn.flashcards.v1': safeParse('firelearn.flashcards.v1') as Record<string, Flashcard> | null,
    'firelearn.syncQueue.v1': safeParse('firelearn.syncQueue.v1') as SyncQueueItem[] | null,
    'firelearn.studyActivity.v1': safeParse('firelearn.studyActivity.v1') as StudyActivityEntry[] | null,
    'firelearn.studyTimer.v1': safeParse('firelearn.studyTimer.v1') as StudyTimerSession | null,
  }
  return validateExportedData(exported)
}

/** Validates and restores only allowlisted FireLearn values, rolling back if a storage write fails. */
export function restoreExportedData(storage: StorageLike, raw: unknown): { restoredKeys: number } {
  const validation = validateExportedData(raw)
  if (!validation.valid) throw new Error(`FireLearn data could not be restored: ${validation.errors.join('; ')}`)

  const presentKeys = restorableKeys.filter((key) => Object.prototype.hasOwnProperty.call(validation.data, key))
  if (presentKeys.length === 0) throw new Error('FireLearn data could not be restored: no recognized progress data was found')

  const previousValues = new Map(presentKeys.map((key) => [key, storage.getItem(key)]))
  try {
    presentKeys.forEach((key) => {
      const value = validation.data[key]
      if (value === null || value === undefined) storage.removeItem(key)
      else storage.setItem(key, JSON.stringify(value))
    })
  } catch (error) {
    previousValues.forEach((value, key) => {
      try {
        if (value === null) storage.removeItem(key)
        else storage.setItem(key, value)
      } catch {
        // Best effort: browser storage can remain unavailable after a quota or security error.
      }
    })
    throw new Error(`FireLearn data could not be restored: ${error instanceof Error ? error.message : 'device storage write failed'}`)
  }
  return { restoredKeys: presentKeys.length }
}
