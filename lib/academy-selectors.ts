import { academyCourses } from '@/data/academy'
import type { Course, Lesson } from '@/types/learning'

export function getCourseBySlug(courseSlug: string): Course | undefined {
  return academyCourses.find((course) => course.slug === courseSlug)
}

export function getLessonBySlug(courseSlug: string, lessonSlug: string): { course: Course; lesson: Lesson } | undefined {
  const course = getCourseBySlug(courseSlug)
  if (!course) return undefined
  const lesson = course.modules.flatMap((module) => module.lessons).find((item) => item.slug === lessonSlug)
  return lesson ? { course, lesson } : undefined
}

export function getAllLessons() {
  return academyCourses.flatMap((course) =>
    course.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({ course, module, lesson })),
    ),
  )
}

export function getCourseStats(course: Course) {
  const lessons = course.modules.flatMap((module) => module.lessons)
  const quizQuestions = lessons.flatMap((lesson) => lesson.quiz)
  const flashcards = lessons.flatMap((lesson) => lesson.flashcards)
  return {
    lessonCount: lessons.length,
    quizQuestionCount: quizQuestions.length,
    flashcardCount: flashcards.length,
    moduleCount: course.modules.length,
  }
}
