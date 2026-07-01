import type { StorageLike, LearnerState, QuizAttempt } from '@/services/local-persistence'
import type { StudyActivityEntry } from '@/services/study-activity'
import type { Flashcard } from '@/types/learning'

export type ExportedData = {
  exportedAt?: string
  'firelearn.learnerState.v1'?: LearnerState | null
  'firelearn.quizHistory.v1'?: QuizAttempt[] | null
  'firelearn.flashcards.v1'?: Record<string, Flashcard> | null
  'firelearn.syncQueue.v1'?: unknown | null
  'firelearn.studyActivity.v1'?: StudyActivityEntry[] | null
}

export type ValidationResult = {
  valid: boolean
  errors: string[]
  data: ExportedData
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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
  if (typeof value.streakDays !== 'number') errors.push('learnerState.streakDays must be a number')
  if (typeof value.xp !== 'number') errors.push('learnerState.xp must be a number')
  if (!Array.isArray(value.completedLessonIds)) errors.push('learnerState.completedLessonIds must be an array')
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
    if (typeof entry.scorePercent !== 'number') errors.push(`quizHistory[${index}].scorePercent must be a number`)
    if (typeof entry.completedAt !== 'string') errors.push(`quizHistory[${index}].completedAt must be a string`)
    if (!Array.isArray(entry.weakTopicIds)) errors.push(`quizHistory[${index}].weakTopicIds must be an array`)
  })
  return value as unknown as QuizAttempt[]
}

function validateStudyActivity(value: unknown, errors: string[]): StudyActivityEntry[] | null {
  if (value === null || value === undefined) return null
  if (!Array.isArray(value)) {
    errors.push('studyActivity is not an array')
    return null
  }
  const validKinds = new Set(['lesson_view', 'lesson_complete', 'quiz_complete', 'flashcard_review', 'study_timer'])
  value.forEach((entry, index) => {
    if (!isObject(entry)) {
      errors.push(`studyActivity[${index}] is not an object`)
      return
    }
    if (typeof entry.kind !== 'string' || !validKinds.has(entry.kind)) {
      errors.push(`studyActivity[${index}].kind is invalid: ${String(entry.kind)}`)
    }
    if (typeof entry.minutes !== 'number') errors.push(`studyActivity[${index}].minutes must be a number`)
    if (typeof entry.createdAt !== 'string') errors.push(`studyActivity[${index}].createdAt must be a string`)
  })
  return value as unknown as StudyActivityEntry[]
}

export function validateExportedData(raw: unknown): ValidationResult {
  const errors: string[] = []

  if (!isObject(raw)) {
    return { valid: false, errors: ['Export root is not an object'], data: {} }
  }

  const data = raw as ExportedData
  validateLearnerState(data['firelearn.learnerState.v1'], errors)
  validateQuizHistory(data['firelearn.quizHistory.v1'], errors)
  validateStudyActivity(data['firelearn.studyActivity.v1'], errors)

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
    'firelearn.syncQueue.v1': safeParse('firelearn.syncQueue.v1'),
    'firelearn.studyActivity.v1': safeParse('firelearn.studyActivity.v1') as StudyActivityEntry[] | null,
  }

  return validateExportedData(exported)
}
