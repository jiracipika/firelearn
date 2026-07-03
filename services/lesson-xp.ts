import type { Course } from '@/types/learning'
import type { CompletedLesson } from '@/services/gamification-aggregator'

export const MIN_LESSON_XP = 25

export function getCourseLessonCount(course: Course): number {
  return course.modules.reduce((count, module) => count + module.lessons.length, 0)
}

export function getLessonXpAward(course: Course): number {
  return Math.max(MIN_LESSON_XP, Math.round(course.xp / Math.max(1, getCourseLessonCount(course))))
}

export function findCourseByLessonId(courses: Course[], lessonId: string): Course | undefined {
  return courses.find((course) =>
    course.modules.some((module) => module.lessons.some((lesson) => lesson.id === lessonId)),
  )
}

export function buildCompletedLessonAwards(courses: Course[], lessonIds: string[]): CompletedLesson[] {
  return lessonIds.map((lessonId) => {
    const course = findCourseByLessonId(courses, lessonId)

    return {
      lessonId,
      courseId: course?.slug ?? 'unknown',
      xpAwarded: course ? getLessonXpAward(course) : MIN_LESSON_XP,
    }
  })
}
