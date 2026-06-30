import { academyCourses } from '@/data/academy'

export type SearchResult = {
  id: string
  type: 'course' | 'lesson' | 'flashcard' | 'quiz-question' | 'topic'
  title: string
  description: string
  href: string
  keywords: string[]
}

type RankedSearchResult = SearchResult & { score: number }

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function tokenize(value: string): string[] {
  return normalize(value).split(/\s+/).filter(Boolean)
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)))
}

function lessonScopedHref(base: string, courseSlug: string, lessonSlug: string) {
  return `${base}?course=${encodeURIComponent(courseSlug)}&lesson=${encodeURIComponent(lessonSlug)}`
}

function scoreResult(item: SearchResult, queryTokens: string[], normalizedQuery: string): number {
  if (queryTokens.length === 0) return 1

  const title = normalize(item.title)
  const description = normalize(item.description)
  const type = normalize(item.type)
  const keywords = item.keywords.map(normalize)
  const haystack = [title, description, type, ...keywords].join(' ')

  if (!queryTokens.every((token) => haystack.includes(token))) return 0

  let score = 0
  if (title === normalizedQuery) score += 120
  if (title.startsWith(normalizedQuery)) score += 70
  if (type === normalizedQuery) score += 55
  if (keywords.includes(normalizedQuery)) score += 45

  for (const token of queryTokens) {
    if (title.includes(token)) score += 30
    if (type.includes(token)) score += 18
    if (keywords.some((keyword) => keyword.includes(token))) score += 16
    if (description.includes(token)) score += 8
  }

  const typePriority: Record<SearchResult['type'], number> = {
    course: 10,
    lesson: 9,
    'quiz-question': 7,
    flashcard: 6,
    topic: 5,
  }

  return score + typePriority[item.type]
}

export function buildSearchIndex(): SearchResult[] {
  return academyCourses.flatMap((course) => {
    const courseKeywords = unique([course.categoryId, course.slug, course.difficulty])
    const courseResult: SearchResult = {
      id: course.id,
      type: 'course',
      title: course.title,
      description: course.description,
      href: `/courses/${course.slug}`,
      keywords: courseKeywords,
    }

    const lessonResults = course.modules.flatMap((module) => module.lessons.flatMap((lesson) => {
      const lessonKeywords = unique([
        course.title,
        course.categoryId,
        module.title,
        lesson.slug,
        lesson.difficulty,
        ...lesson.objectives,
        ...lesson.prerequisites,
        ...lesson.references,
      ])
      const lessonResult: SearchResult = {
        id: lesson.id,
        type: 'lesson',
        title: lesson.title,
        description: lesson.summary.join(' '),
        href: `/courses/${course.slug}/${lesson.slug}`,
        keywords: lessonKeywords,
      }
      const quizResults: SearchResult[] = lesson.quiz.map((question) => ({
        id: question.id,
        type: 'quiz-question',
        title: question.prompt,
        description: question.explanation,
        href: lessonScopedHref('/quiz', course.slug, lesson.slug),
        keywords: unique([course.title, course.categoryId, module.title, lesson.title, ...question.topicIds]),
      }))
      const flashcardResults: SearchResult[] = lesson.flashcards.map((card) => ({
        id: card.id,
        type: 'flashcard',
        title: card.front,
        description: card.back,
        href: lessonScopedHref('/flashcards', course.slug, lesson.slug),
        keywords: unique([course.title, course.categoryId, module.title, lesson.title, ...card.topicIds]),
      }))
      return [lessonResult, ...quizResults, ...flashcardResults]
    }))

    return [courseResult, ...lessonResults]
  })
}

export function rankSearchResults(query: string, index = buildSearchIndex()): RankedSearchResult[] {
  const normalizedQuery = normalize(query)
  const queryTokens = tokenize(query)

  if (queryTokens.length === 0) {
    return index.slice(0, 12).map((item) => ({ ...item, score: 1 }))
  }

  return index
    .map((item) => ({ ...item, score: scoreResult(item, queryTokens, normalizedQuery) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
}

export function searchFireLearn(query: string, index = buildSearchIndex()) {
  return rankSearchResults(query, index).slice(0, query.trim() ? 24 : 12)
}
