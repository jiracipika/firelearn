import { academyCourses } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { FlashcardReview } from '@/components/flashcards/flashcard-review'

type FlashcardPreviewProps = {
  courseSlug?: string
  lessonSlug?: string
}

export function FlashcardPreview({ courseSlug, lessonSlug }: FlashcardPreviewProps) {
  const course = academyCourses.find((item) => item.slug === courseSlug)
  const lesson = course?.modules.flatMap((module) => module.lessons).find((item) => item.slug === lessonSlug)
  const cards = lesson
    ? lesson.flashcards
    : academyCourses.flatMap((course) => course.modules.flatMap((module) => module.lessons.flatMap((lesson) => lesson.flashcards)))
  return <AppShell><FlashcardReview initialCards={cards.slice(0, lesson ? cards.length : 18)} /></AppShell>
}
