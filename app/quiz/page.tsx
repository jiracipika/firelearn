import type { Metadata } from 'next'
import { QuizPreview } from '@/components/quiz/quiz-preview'

export const metadata: Metadata = {
  title: 'Quiz Practice',
  description: 'Practice and exam-mode firefighter quizzes with instant feedback, explanations, weak-topic detection, and timed questions.',
  openGraph: {
    title: 'FireLearn Quiz Practice',
    description: 'Scenario-heavy firefighter quiz bank with practice and exam modes.',
  },
}

export default async function QuizPage({ searchParams }: { searchParams: Promise<{ course?: string; lesson?: string }> }) {
  const { course, lesson } = await searchParams
  return <QuizPreview courseSlug={course} lessonSlug={lesson} />
}
