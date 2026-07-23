import { academyCourses } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { QuizEngine } from '@/components/quiz/quiz-engine'

type QuizPreviewProps = {
  courseSlug?: string
  lessonSlug?: string
}

export function QuizPreview({ courseSlug, lessonSlug }: QuizPreviewProps) {
  const course = academyCourses.find((item) => item.slug === courseSlug)
  const lesson = course?.modules.flatMap((module) => module.lessons).find((item) => item.slug === lessonSlug)
  const questions = lesson
    ? lesson.quiz
    : academyCourses.flatMap((course) => course.modules.flatMap((module) => module.lessons.flatMap((lesson) => lesson.quiz)))
  const title = lesson
    ? `${lesson.title} quiz · ${questions.length} questions`
    : `FireLearn mixed practice · ${questions.length} questions`
  const quizId = lesson && course
    ? `lesson:${course.slug}:${lesson.slug}`
    : 'mixed-practice'

  return <AppShell><QuizEngine quizId={quizId} title={title} questions={questions} /></AppShell>
}
