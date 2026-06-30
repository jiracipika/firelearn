import { FlashcardPreview } from '@/components/flashcards/flashcard-preview'

export default async function FlashcardsPage({ searchParams }: { searchParams: Promise<{ course?: string; lesson?: string }> }) {
  const { course, lesson } = await searchParams
  return <FlashcardPreview courseSlug={course} lessonSlug={lesson} />
}
