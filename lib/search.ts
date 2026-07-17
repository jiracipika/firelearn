import { academyCourses } from '@/data/academy'
import type { Course } from '@/types/learning'

export type SearchResult = {
  id: string
  type: 'course' | 'lesson' | 'flashcard' | 'quiz-question' | 'topic'
  courseId?: string
  courseSlug?: string
  title: string
  description: string
  href: string
  keywords: string[]
}

export type CourseCatalogMatch = {
  course: Course
  matchCount: number
  matchedTypes: SearchResult['type'][]
  topMatches: SearchResult[]
}

type RankedSearchResult = SearchResult & { score: number }
type ScoredCourseCatalogMatch = CourseCatalogMatch & { score: number }

function stripScore(result: RankedSearchResult): SearchResult {
  return {
    id: result.id,
    type: result.type,
    courseId: result.courseId,
    courseSlug: result.courseSlug,
    title: result.title,
    description: result.description,
    href: result.href,
    keywords: result.keywords,
  }
}

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

/**
 * Levenshtein edit distance — the minimum number of single-character
 * insertions, deletions, or substitutions to transform `a` into `b`.
 * Used as a fallback to rescue typoed queries that exact substring
 * matching misses entirely (e.g. "SCUBA" vs "SCBA", "ventaltion" vs
 * "ventilation"). Implemented with a single rolling array for O(n) space.
 */
function editDistance(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const previous = new Array<number>(b.length + 1)
  for (let j = 0; j <= b.length; j++) previous[j] = j

  for (let i = 1; i <= a.length; i++) {
    let scratch = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const tmp = previous[j]
      previous[j] = Math.min(
        previous[j] + 1,        // deletion
        previous[j - 1] + 1,    // insertion
        scratch + cost,          // substitution (or match)
      )
      scratch = tmp
    }
    previous[0] = i
  }

  return previous[b.length]
}

/**
 * Maximum tolerated edit distance for a token of a given length. Short
 * words (<=4 chars) allow only 1 typo so "fire" does not match "wire".
 * Medium words allow 2; long words allow up to 2 as well. The threshold
 * scales with length so common short words do not produce noise.
 */
function fuzzyThreshold(length: number): number {
  if (length <= 4) return 1
  return 2
}

/**
 * Check whether `token` matches any word in `haystackWords` within the
 * fuzzy edit-distance threshold. Returns true if an exact substring match
 * exists OR if a word is close enough by edit distance. This is the typo
 * rescue path — exact matches still win on score.
 */
function fuzzyMatchToken(token: string, haystackWords: string[]): boolean {
  if (token.length === 0) return false
  const threshold = fuzzyThreshold(token.length)

  for (const word of haystackWords) {
    if (word.includes(token)) return true
    // Only compare against words of similar length — avoids spurious
    // matches between very short tokens and very long words.
    if (Math.abs(word.length - token.length) <= threshold) {
      if (editDistance(token, word) <= threshold) return true
    }
  }
  return false
}

function scoreResult(item: SearchResult, queryTokens: string[], normalizedQuery: string): number {
  if (queryTokens.length === 0) return 1

  const title = normalize(item.title)
  const description = normalize(item.description)
  const type = normalize(item.type)
  const keywords = item.keywords.map(normalize)
  const haystack = [title, description, type, ...keywords].join(' ')

  // Fast path: every token must match. If even one token has no exact
  // substring hit, fall back to fuzzy matching for typo tolerance.
  const exactMatch = queryTokens.every((token) => haystack.includes(token))
  let fuzzyBonus = 0

  if (!exactMatch) {
    const haystackWords = haystack.split(/\s+/).filter(Boolean)
    if (!queryTokens.every((token) => fuzzyMatchToken(token, haystackWords))) return 0
    // Fuzzy matches rank below exact matches but above no-match. The
    // penalty is proportional to how many tokens needed fuzzy rescue.
    const fuzzyCount = queryTokens.filter((token) => !haystack.includes(token)).length
    fuzzyBonus = Math.round((1 - fuzzyCount / queryTokens.length) * 12)
  }

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

  // Only add fuzzyBonus for items that did NOT pass exact matching, so
  // exact matches keep their higher score and outrank fuzzy rescues.
  return exactMatch ? score + typePriority[item.type] : fuzzyBonus + typePriority[item.type]
}

export function buildSearchIndex(): SearchResult[] {
  return academyCourses.flatMap((course) => {
    const courseKeywords = unique([course.categoryId, course.slug, course.difficulty])
    const courseResult: SearchResult = {
      id: course.id,
      type: 'course',
      courseId: course.id,
      courseSlug: course.slug,
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
        courseId: course.id,
        courseSlug: course.slug,
        title: lesson.title,
        description: lesson.summary.join(' '),
        href: `/courses/${course.slug}/${lesson.slug}`,
        keywords: lessonKeywords,
      }
      const quizResults: SearchResult[] = lesson.quiz.map((question) => ({
        id: question.id,
        type: 'quiz-question',
        courseId: course.id,
        courseSlug: course.slug,
        title: question.prompt,
        description: question.explanation,
        href: lessonScopedHref('/quiz', course.slug, lesson.slug),
        keywords: unique([course.title, course.categoryId, module.title, lesson.title, ...question.topicIds]),
      }))
      const flashcardResults: SearchResult[] = lesson.flashcards.map((card) => ({
        id: card.id,
        type: 'flashcard',
        courseId: course.id,
        courseSlug: course.slug,
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

export function searchCourseCatalog(query: string, courses = academyCourses): CourseCatalogMatch[] {
  if (!query.trim()) {
    return courses.map((course) => ({ course, matchCount: 0, matchedTypes: [], topMatches: [] }))
  }

  const ranked = rankSearchResults(query)
  const allowedCourseIds = new Set(courses.map((course) => course.id))
  const grouped = new Map<string, RankedSearchResult[]>()

  for (const result of ranked) {
    const courseId = result.courseId ?? (result.type === 'course' ? result.id : undefined)
    if (!courseId || !allowedCourseIds.has(courseId)) continue
    grouped.set(courseId, [...(grouped.get(courseId) ?? []), result])
  }

  return Array.from(grouped.entries())
    .map(([courseId, matches]) => {
      const course = courses.find((candidate) => candidate.id === courseId)
      if (!course) return null
      return {
        course,
        matchCount: matches.length,
        matchedTypes: unique(matches.map((match) => match.type)) as SearchResult['type'][],
        topMatches: matches.slice(0, 3).map(stripScore),
        score: matches[0]?.score ?? 0,
      }
    })
    .filter((match): match is ScoredCourseCatalogMatch => Boolean(match))
    .sort((a, b) => b.score - a.score || a.course.title.localeCompare(b.course.title))
    .map((match) => ({
      course: match.course,
      matchCount: match.matchCount,
      matchedTypes: match.matchedTypes,
      topMatches: match.topMatches,
    }))
}
