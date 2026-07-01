import type { QuizResult } from '@/services/quiz-engine'
import type { StorageLike, QuizAttempt } from '@/services/local-persistence'
import { recordQuizResult, getBrowserStorage } from '@/services/local-persistence'
import { recordStudyActivity } from '@/services/study-activity'

export type QuizRecording = {
  quizId: string
  result: QuizResult
  questionCount: number
  completedAt: string
}

export type QuizRecordingOutcome = {
  recorded: boolean
  attempt: QuizAttempt
}

/**
 * Record a completed quiz result to local persistence and study activity.
 * This is a pure function over the storage adapter — testable without React.
 */
export function recordQuizOutcome(storage: StorageLike, recording: QuizRecording): QuizRecordingOutcome {
  const attempt: QuizAttempt = {
    quizId: recording.quizId,
    scorePercent: recording.result.scorePercent,
    weakTopicIds: recording.result.weakTopicIds,
    completedAt: recording.completedAt,
  }

  recordQuizResult(storage, attempt)
  recordStudyActivity(storage, {
    kind: 'quiz_complete',
    minutes: Math.max(3, Math.round(recording.questionCount * 0.75)),
    entityId: recording.quizId,
    createdAt: recording.completedAt,
  })

  return { recorded: true, attempt }
}

/**
 * Browser-side convenience wrapper that handles the storage availability check.
 */
export function recordQuizOutcomeBrowser(recording: QuizRecording): QuizRecordingOutcome | null {
  const storage = getBrowserStorage()
  if (!storage) return null
  return recordQuizOutcome(storage, recording)
}
