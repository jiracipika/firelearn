import {
  loadLearnerState,
  loadQuizHistory,
  recordQuizResult,
  saveLearnerState,
  type QuizAttempt,
  type StorageLike,
} from '@/services/local-persistence'

export type SyncEntity = 'lesson_completion' | 'quiz_attempt' | 'flashcard_review'
export type SyncOperation = 'upsert' | 'insert' | 'delete'
export type SyncStatus = 'pending' | 'synced' | 'failed'

export type SyncQueueItem = {
  id: string
  entity: SyncEntity
  operation: SyncOperation
  payload: Record<string, unknown>
  status: SyncStatus
  createdAt: string
}

export type CompleteLessonInput = {
  lessonId: string
  courseId: string
  xpAwarded: number
}

const syncQueueKey = 'firelearn.syncQueue.v1'

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function loadSyncQueue(storage: StorageLike): SyncQueueItem[] {
  return safeParse(storage.getItem(syncQueueKey), [])
}

function saveSyncQueue(storage: StorageLike, queue: SyncQueueItem[]) {
  storage.setItem(syncQueueKey, JSON.stringify(queue))
}

function queueOperation(storage: StorageLike, item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'status'>) {
  const createdAt = new Date().toISOString()
  const queueItem: SyncQueueItem = {
    ...item,
    id: `${item.entity}-${createdAt}-${Math.random().toString(36).slice(2)}`,
    status: 'pending',
    createdAt,
  }
  saveSyncQueue(storage, [...loadSyncQueue(storage), queueItem])
}

export function createOfflineProgressRepository(storage: StorageLike) {
  return {
    completeLesson(input: CompleteLessonInput) {
      const state = loadLearnerState(storage)
      const alreadyCompleted = state.completedLessonIds.includes(input.lessonId)
      if (!alreadyCompleted) {
        saveLearnerState(storage, {
          ...state,
          completedLessonIds: [...state.completedLessonIds, input.lessonId],
          xp: state.xp + input.xpAwarded,
        })
        queueOperation(storage, {
          entity: 'lesson_completion',
          operation: 'upsert',
          payload: input,
        })
      }
    },
    getLearnerState() {
      return loadLearnerState(storage)
    },
    recordQuizAttempt(attempt: QuizAttempt) {
      recordQuizResult(storage, attempt)
      queueOperation(storage, {
        entity: 'quiz_attempt',
        operation: 'insert',
        payload: attempt,
      })
    },
    getQuizHistory() {
      return loadQuizHistory(storage)
    },
    getSyncQueue() {
      return loadSyncQueue(storage)
    },
    clearSyncedQueueItems(ids: string[]) {
      saveSyncQueue(storage, loadSyncQueue(storage).filter((item) => !ids.includes(item.id)))
    },
  }
}

export function getCourseProgressPercent({
  lessonIds,
  completedLessonIds,
}: {
  lessonIds: string[]
  completedLessonIds: string[]
}) {
  if (lessonIds.length === 0) return 0
  const completed = lessonIds.filter((lessonId) => completedLessonIds.includes(lessonId)).length
  return Math.round((completed / lessonIds.length) * 100)
}

export function getWeakTopicSummary(history: QuizAttempt[]) {
  const counts = new Map<string, number>()
  history.forEach((attempt) => {
    attempt.weakTopicIds.forEach((topicId) => counts.set(topicId, (counts.get(topicId) ?? 0) + 1))
  })

  return [...counts.entries()]
    .map(([topicId, misses]) => ({ topicId, misses }))
    .sort((a, b) => b.misses - a.misses || a.topicId.localeCompare(b.topicId))
}
