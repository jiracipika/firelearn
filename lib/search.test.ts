import { describe, expect, it } from 'vitest'
import { buildSearchIndex, rankSearchResults, searchFireLearn } from '@/lib/search'

describe('search', () => {
  it('indexes courses, lessons, flashcards, and quiz questions', () => {
    const index = buildSearchIndex()
    const types = new Set(index.map((item) => item.type))

    expect(types.has('course')).toBe(true)
    expect(types.has('lesson')).toBe(true)
    expect(types.has('flashcard')).toBe(true)
    expect(types.has('quiz-question')).toBe(true)
  })

  it('finds SCBA learning materials', () => {
    const results = searchFireLearn('SCBA')

    expect(results.some((result) => result.title.includes('SCBA') || result.description.includes('SCBA') || result.keywords.some((keyword) => keyword.includes('SCBA')))).toBe(true)
  })

  it('ranks exact title matches above description-only matches', () => {
    const results = rankSearchResults('SCBA')

    expect(results[0]?.title.toLowerCase()).toContain('scba')
    expect(results[0]?.score).toBeGreaterThan(results.at(-1)?.score ?? 0)
  })

  it('requires every query token to match somewhere in the indexed material', () => {
    const results = searchFireLearn('smoke indicators')

    expect(results.length).toBeGreaterThan(0)
    expect(results.every((result) => `${result.title} ${result.description} ${result.keywords.join(' ')}`.toLowerCase().includes('smoke'))).toBe(true)
    expect(results.every((result) => `${result.title} ${result.description} ${result.keywords.join(' ')}`.toLowerCase().includes('indicators'))).toBe(true)
  })

  it('links quiz and flashcard results to the owning lesson scope', () => {
    const index = buildSearchIndex()
    const quizResult = index.find((result) => result.type === 'quiz-question')
    const flashcardResult = index.find((result) => result.type === 'flashcard')

    expect(quizResult?.href).toMatch(/^\/quiz\?course=[^&]+&lesson=/)
    expect(flashcardResult?.href).toMatch(/^\/flashcards\?course=[^&]+&lesson=/)
  })
})
