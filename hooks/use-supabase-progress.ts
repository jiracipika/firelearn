'use client'

import * as React from 'react'
import { getBrowserStorage, type QuizAttempt } from '@/services/local-persistence'
import { createOfflineProgressRepository, type CompleteLessonInput } from '@/services/offline-progress'
import { createFireLearnBrowserSupabaseClient, getSupabaseProjectRef } from '@/services/supabase/client'
import {
  completeLessonInSupabase,
  formatSupabaseAuthError,
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
    setLoading(true)
    try {
      const { error: signInError } = await signInAnonymously(client)
      if (signInError) {
        setError(formatSupabaseAuthError(signInError) ?? signInError.message)
        return
      }
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Supabase authentication failed.')
    } finally {
      setLoading(false)
    }
  }, [refresh])

  const completeLesson = React.useCallback(async (input: CompleteLessonInput, clientMutationId?: string) => {
    const client = createFireLearnBrowserSupabaseClient()
    if (!client) return
    try {
      await completeLessonInSupabase(client, input, clientMutationId)
      const storage = getBrowserStorage()
      if (storage && clientMutationId) createOfflineProgressRepository(storage).clearSyncedQueueItems([clientMutationId])
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
    projectRef: getSupabaseProjectRef(),
    completedLessonIds,
    quizHistory,
    completeLesson,
    signIn,
    refresh,
  }
}
