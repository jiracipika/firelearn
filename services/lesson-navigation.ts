import type { Course, Lesson } from '@/types/learning'

export type LessonSequence = {
  previous?: Lesson
  current?: Lesson
  next?: Lesson
  index: number
  total: number
}

export function flattenCourseLessons(course: Course): Lesson[] {
  return course.modules.flatMap((courseModule) => courseModule.lessons)
}

export function getLessonSequence(course: Course, lessonId: string): LessonSequence {
  const lessons = flattenCourseLessons(course)
  const index = lessons.findIndex((lesson) => lesson.id === lessonId)

  if (index === -1) {
    return { index: -1, total: lessons.length }
  }

  return {
    previous: index > 0 ? lessons[index - 1] : undefined,
    current: lessons[index],
    next: index < lessons.length - 1 ? lessons[index + 1] : undefined,
    index,
    total: lessons.length,
  }
}

export function getLessonPracticeHref(kind: 'quiz' | 'flashcards', course: Course, lesson: Lesson): string {
  return `/${kind}?course=${encodeURIComponent(course.slug)}&lesson=${encodeURIComponent(lesson.slug)}`
}
