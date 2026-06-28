'use client'

import * as React from 'react'
import type { QuizAttempt } from '@/services/local-persistence'
import type { CompleteLessonInput } from '@/services/offline-progress'
import { createFireLearnBrowserSupabaseClient } from '@/services/supabase/client'
import {
  completeLessonInSupabase,
  loadSupabaseProgress,
  signInAnonymously,
} from '@/services/supabase/progress'

export function useSupabaseProgress() {
  const [completedLessonIds, setCompletedLessonIds] = React.useState<string[]>([])
  const [quizHistory, setQuizHistory] = React.useState<QuizAttempt[]>([])
  const [authenticated, setAuthenticated] = React.useState(false)
  const [available, setAvailable] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    const client = createFireLearnBrowserSupabaseClient()
    setAvailable(Boolean(client))
    if (!client) {
      setLoading(false)
      return
    }

    try {
      const progress = await loadSupabaseProgress(client)
      setAuthenticated(progress.authenticated)
      setCompletedLessonIds(progress.completedLessonIds)
      setQuizHistory(progress.quizHistory)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load Supabase progress')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    window.queueMicrotask(() => {
      void refresh()
    })
  }, [refresh])

  const signIn = React.useCallback(async () => {
    const client = createFireLearnBrowserSupabaseClient()
    if (!client) return
    const { error: signInError } = await signInAnonymously(client)
    if (signInError) {
      setError(signInError.message)
      return
    }
    await refresh()
  }, [refresh])

  const completeLesson = React.useCallback(async (input: CompleteLessonInput) => {
    const client = createFireLearnBrowserSupabaseClient()
    if (!client) return
    try {
      await completeLessonInSupabase(client, input)
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save lesson progress')
    }
  }, [refresh])

  return {
    available,
    authenticated,
    loading,
    error,
    completedLessonIds,
    quizHistory,
    completeLesson,
    signIn,
    refresh,
  }
}
