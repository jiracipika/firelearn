'use client'

import * as React from 'react'
import { getBrowserStorage, loadLearnerState, loadQuizHistory, type LearnerState, type QuizAttempt } from '@/services/local-persistence'
import { createOfflineProgressRepository, getWeakTopicSummary, type CompleteLessonInput } from '@/services/offline-progress'

const emptyState: LearnerState = {
  completedLessonIds: [],
  dailyGoalMinutes: 25,
  xp: 0,
  streakDays: 0,
}

export function useOfflineProgress() {
  const [learnerState, setLearnerState] = React.useState<LearnerState>(emptyState)
  const [quizHistory, setQuizHistory] = React.useState<QuizAttempt[]>([])
  const [syncQueueCount, setSyncQueueCount] = React.useState(0)

  const refresh = React.useCallback(() => {
    const storage = getBrowserStorage()
    if (!storage) return
    const repo = createOfflineProgressRepository(storage)
    setLearnerState(loadLearnerState(storage))
    setQuizHistory(loadQuizHistory(storage))
    setSyncQueueCount(repo.getSyncQueue().filter((item) => item.status === 'pending').length)
  }, [])

  React.useEffect(() => {
    window.queueMicrotask(refresh)
  }, [refresh])

  const completeLesson = React.useCallback((input: CompleteLessonInput) => {
    const storage = getBrowserStorage()
    if (!storage) return
    createOfflineProgressRepository(storage).completeLesson(input)
    refresh()
  }, [refresh])

  return {
    learnerState,
    quizHistory,
    weakTopics: getWeakTopicSummary(quizHistory),
    syncQueueCount,
    completeLesson,
    refresh,
  }
}
