import { describe, expect, it } from 'vitest'
import { academyCourses } from '@/data/academy'
import { getCourseProgress } from '@/services/course-progress'
import type { Course } from '@/types/learning'

function emptyCourse(): Course {
  return {
    id: 'empty-course',
    slug: 'empty-course',
    title: 'Empty course',
    description: 'No lessons yet',
    categoryId: 'operations',
    difficulty: 'Recruit',
    estimatedMinutes: 0,
    progressPercent: 0,
    xp: 0,
    modules: [],
  }
}

describe('course progress', () => {
  it('reports the next lesson and a rounded completion percentage in course order', () => {
    const course = academyCourses[0]
    const lessons = course.modules.flatMap((courseModule) => courseModule.lessons)
    const progress = getCourseProgress(course, [lessons[0].id])

    expect(progress).toMatchObject({
      completedCount: 1,
      totalCount: lessons.length,
      percent: Math.round(100 / lessons.length),
      isComplete: false,
    })
    expect(progress.nextLesson?.id).toBe(lessons[1].id)
  })

  it('ignores duplicate and unrelated completion ids', () => {
    const course = academyCourses[0]
    const lessons = course.modules.flatMap((courseModule) => courseModule.lessons)
    const progress = getCourseProgress(course, [lessons[0].id, lessons[0].id, 'other-course-lesson'])

    expect(progress.completedCount).toBe(1)
    expect(progress.completedLessonIds).toEqual([lessons[0].id])
  })

  it('only unlocks completion when every course lesson is complete', () => {
    const course = academyCourses[0]
    const lessons = course.modules.flatMap((courseModule) => courseModule.lessons)
    const progress = getCourseProgress(course, lessons.map((lesson) => lesson.id))

    expect(progress.percent).toBe(100)
    expect(progress.isComplete).toBe(true)
    expect(progress.nextLesson).toBeUndefined()
  })

  it('does not treat an empty course as completed', () => {
    expect(getCourseProgress(emptyCourse(), [])).toEqual({
      completedCount: 0,
      totalCount: 0,
      percent: 0,
      isComplete: false,
      completedLessonIds: [],
      nextLesson: undefined,
    })
  })
})
