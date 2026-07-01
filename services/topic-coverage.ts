import type { Course } from '@/types/learning'

export type TopicCoverage = {
  topicId: string
  lessonCount: number
  quizCount: number
  flashcardCount: number
  courses: string[]
}

export type CoverageReport = {
  totalTopics: number
  topicsWithQuizzes: number
  topicsWithFlashcards: number
  topicsWithLessons: number
  uncoveredTopics: string[]
  coverage: TopicCoverage[]
}

export function computeTopicCoverage(courses: Course[]): CoverageReport {
  const coverageMap = new Map<string, TopicCoverage>()

  function ensure(topicId: string): TopicCoverage {
    let entry = coverageMap.get(topicId)
    if (!entry) {
      entry = { topicId, lessonCount: 0, quizCount: 0, flashcardCount: 0, courses: [] }
      coverageMap.set(topicId, entry)
    }
    return entry
  }

  for (const course of courses) {
    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        const lessonTopics = new Set<string>()

        for (const question of lesson.quiz) {
          for (const topicId of question.topicIds) {
            const entry = ensure(topicId)
            entry.quizCount += 1
            lessonTopics.add(topicId)
          }
        }

        for (const card of lesson.flashcards) {
          for (const topicId of card.topicIds) {
            const entry = ensure(topicId)
            entry.flashcardCount += 1
            lessonTopics.add(topicId)
          }
        }

        for (const topicId of lessonTopics) {
          const entry = ensure(topicId)
          entry.lessonCount += 1
          if (!entry.courses.includes(course.title)) {
            entry.courses.push(course.title)
          }
        }
      }
    }
  }

  const coverage = Array.from(coverageMap.values()).sort((a, b) => a.topicId.localeCompare(b.topicId))

  return {
    totalTopics: coverage.length,
    topicsWithQuizzes: coverage.filter((t) => t.quizCount > 0).length,
    topicsWithFlashcards: coverage.filter((t) => t.flashcardCount > 0).length,
    topicsWithLessons: coverage.filter((t) => t.lessonCount > 0).length,
    uncoveredTopics: coverage.filter((t) => t.quizCount === 0 && t.flashcardCount === 0).map((t) => t.topicId),
    coverage,
  }
}
