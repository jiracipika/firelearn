'use client'

import useSWR from 'swr'
import { courses as baseCourses, type Course } from '@/lib/mock-data'
import { useAuth } from '@/components/auth-provider'
import { fetchCourseProgress } from '@/lib/progress'

/**
 * Returns the catalog with any saved per-course progress merged in for the
 * signed-in user. Falls back to the static demo progress when signed out.
 */
export function useCoursesWithProgress(): Course[] {
  const { user } = useAuth()
  const { data: saved } = useSWR(
    user ? ['course-progress', user.id] : null,
    fetchCourseProgress,
  )

  if (!saved || saved.length === 0) return baseCourses

  const byId = new Map(saved.map((row) => [row.course_id, row]))
  return baseCourses.map((course) => {
    const row = byId.get(course.id)
    return row ? { ...course, progress: row.progress } : course
  })
}
