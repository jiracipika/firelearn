import { academyCourses } from '@/data/academy'

export type SearchResult = {
  id: string
  type: 'course' | 'lesson' | 'flashcard' | 'quiz-question' | 'topic'
  title: string
  description: string
  href: string
}

export function buildSearchIndex(): SearchResult[] {
  return academyCourses.flatMap((course) => {
    const courseResult: SearchResult = {
      id: course.id,
      type: 'course',
      title: course.title,
      description: course.description,
      href: `/courses/${course.slug}`,
    }

    const lessonResults = course.modules.flatMap((module) => module.lessons.flatMap((lesson) => {
      const lessonResult: SearchResult = {
        id: lesson.id,
        type: 'lesson',
        title: lesson.title,
        description: lesson.summary.join(' '),
        href: `/courses/${course.slug}/${lesson.slug}`,
      }
      const quizResults: SearchResult[] = lesson.quiz.map((question) => ({
        id: question.id,
        type: 'quiz-question',
        title: question.prompt,
        description: question.explanation,
        href: '/quiz',
      }))
      const flashcardResults: SearchResult[] = lesson.flashcards.map((card) => ({
        id: card.id,
        type: 'flashcard',
        title: card.front,
        description: card.back,
        href: '/flashcards',
      }))
      return [lessonResult, ...quizResults, ...flashcardResults]
    }))

    return [courseResult, ...lessonResults]
  })
}

export function searchFireLearn(query: string, index = buildSearchIndex()) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return index.slice(0, 12)
  return index.filter((item) => [item.title, item.description, item.type].some((value) => value.toLowerCase().includes(normalized))).slice(0, 24)
}
