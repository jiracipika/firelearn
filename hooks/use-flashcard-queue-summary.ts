'use client'

import * as React from 'react'
import { academyCourses } from '@/data/academy'
import { getBrowserStorage } from '@/services/local-persistence'
import { loadFlashcardQueueSummary, type FlashcardQueueSummary } from '@/services/flashcard-queue'

const emptySummary: FlashcardQueueSummary = {
  totalCards: 0,
  dueToday: 0,
  overdue: 0,
  dueCount: 0,
  newCards: 0,
  learning: 0,
  mature: 0,
}

export function useFlashcardQueueSummary() {
  const [summary, setSummary] = React.useState<FlashcardQueueSummary>(emptySummary)

  const refresh = React.useCallback(() => {
    const storage = getBrowserStorage()
    if (!storage) {
      setSummary(emptySummary)
      return
    }
    setSummary(loadFlashcardQueueSummary(storage, academyCourses))
  }, [])

  React.useEffect(() => {
    window.queueMicrotask(refresh)
  }, [refresh])

  return { ...summary, refresh }
}
