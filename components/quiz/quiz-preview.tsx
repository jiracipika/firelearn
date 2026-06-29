import { academyCourses } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { QuizEngine } from '@/components/quiz/quiz-engine'

export function QuizPreview() {
  const questions = academyCourses.flatMap((course) => course.modules.flatMap((module) => module.lessons.flatMap((lesson) => lesson.quiz)))
  return <AppShell><QuizEngine title="FireLearn mixed practice" questions={questions.slice(0, 12)} /></AppShell>
}
