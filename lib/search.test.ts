import { describe, expect, it } from 'vitest'
import { buildSearchIndex, searchFireLearn } from '@/lib/search'

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

    expect(results.some((result) => result.title.includes('SCBA') || result.description.includes('SCBA'))).toBe(true)
  })
})
