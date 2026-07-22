import type { Course, Lesson } from '@/types/learning'

export type CourseProgress = {
  completedCount: number
  totalCount: number
  percent: number
  isComplete: boolean
  completedLessonIds: string[]
  nextLesson: Lesson | undefined
}

export function getCourseProgress(course: Course, completedLessonIds: string[]): CourseProgress {
  const lessons = course.modules.flatMap((courseModule) => courseModule.lessons)
  const completedSet = new Set(completedLessonIds)
  const completedInCourse = lessons.filter((lesson) => completedSet.has(lesson.id))
  const totalCount = lessons.length
  const completedCount = completedInCourse.length

  return {
    completedCount,
    totalCount,
    percent: totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
    isComplete: totalCount > 0 && completedCount === totalCount,
    completedLessonIds: completedInCourse.map((lesson) => lesson.id),
    nextLesson: lessons.find((lesson) => !completedSet.has(lesson.id)),
  }
}
