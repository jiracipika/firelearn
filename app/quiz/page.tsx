import { QuizPreview } from '@/components/quiz/quiz-preview'

export default async function QuizPage({ searchParams }: { searchParams: Promise<{ course?: string; lesson?: string }> }) {
  const { course, lesson } = await searchParams
  return <QuizPreview courseSlug={course} lessonSlug={lesson} />
}
