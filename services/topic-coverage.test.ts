import { describe, expect, it } from 'vitest'
import { academyCourses } from '@/data/academy'
import { computeTopicCoverage } from '@/services/topic-coverage'

describe('topic coverage', () => {
  it('computes coverage from the live catalog', () => {
    const report = computeTopicCoverage(academyCourses)

    expect(report.totalTopics).toBeGreaterThan(0)
    expect(report.topicsWithQuizzes).toBeGreaterThan(0)
    expect(report.topicsWithFlashcards).toBeGreaterThan(0)
    expect(report.topicsWithLessons).toBeGreaterThan(0)
  })

  it('does not report uncovered topics when catalog has content', () => {
    const report = computeTopicCoverage(academyCourses)

    // Every topic in the catalog should have at least a quiz or flashcard
    expect(report.uncoveredTopics).toHaveLength(0)
  })

  it('counts quiz and flashcard entries per topic', () => {
    const report = computeTopicCoverage(academyCourses)
    const firstTopic = report.coverage[0]

    expect(firstTopic).toBeDefined()
    expect(firstTopic.quizCount + firstTopic.flashcardCount).toBeGreaterThan(0)
    expect(firstTopic.courses.length).toBeGreaterThan(0)
  })

  it('handles empty catalog gracefully', () => {
    const report = computeTopicCoverage([])

    expect(report.totalTopics).toBe(0)
    expect(report.coverage).toEqual([])
  })
})
