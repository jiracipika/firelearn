import { academyCourses } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { FlashcardReview } from '@/components/flashcards/flashcard-review'

export function FlashcardPreview() {
  const cards = academyCourses.flatMap((course) => course.modules.flatMap((module) => module.lessons.flatMap((lesson) => lesson.flashcards)))
  return <AppShell><FlashcardReview initialCards={cards.slice(0, 18)} /></AppShell>
}
