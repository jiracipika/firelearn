'use client'

import * as React from 'react'
import type { Course } from '@/types/learning'
import { getCourseProgress } from '@/services/course-progress'
import { useOfflineProgress } from '@/hooks/use-offline-progress'
import { useSupabaseProgress } from '@/hooks/use-supabase-progress'

export function useCourseProgress(course: Course) {
  const offline = useOfflineProgress()
  const supabase = useSupabaseProgress()
  const completedLessonIds = React.useMemo(
    () => [...new Set([...supabase.completedLessonIds, ...offline.learnerState.completedLessonIds])],
    [offline.learnerState.completedLessonIds, supabase.completedLessonIds],
  )
  const progress = React.useMemo(
    () => getCourseProgress(course, completedLessonIds),
    [completedLessonIds, course],
  )

  return {
    ...progress,
    loading: supabase.loading || !offline.ready,
    syncQueueCount: offline.syncQueueCount,
    supabaseAvailable: supabase.available,
    authenticated: supabase.authenticated,
    syncError: supabase.error,
  }
}
