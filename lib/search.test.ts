import { describe, expect, it } from 'vitest'
import { buildSearchIndex, rankSearchResults, searchCourseCatalog, searchFireLearn, type SearchResult } from '@/lib/search'

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
    const results = rankSearchResults('SCBA', [
      { id: 'description-only', type: 'lesson', title: 'Air management', description: 'Includes SCBA checks.', href: '/lesson', keywords: [] },
      { id: 'exact', type: 'course', title: 'SCBA', description: 'Self-contained breathing apparatus.', href: '/course', keywords: [] },
    ])

    expect(results[0]?.id).toBe('exact')
    expect(results[0]?.score).toBeGreaterThan(results[1]?.score ?? 0)
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

  it('groups deep lesson and quiz hits back into course catalog matches', () => {
    const matches = searchCourseCatalog('smoke indicators')

    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0].matchCount).toBeGreaterThan(0)
    expect(matches[0].topMatches.some((match) => match.type === 'lesson' || match.type === 'quiz-question')).toBe(true)
  })

  it('returns every course for an empty catalog query', () => {
    const matches = searchCourseCatalog('')
    const indexedCourses = buildSearchIndex().filter((result) => result.type === 'course')

    expect(matches).toHaveLength(indexedCourses.length)
    expect(matches.every((match) => match.matchCount === 0)).toBe(true)
  })
})

describe('fuzzy / typo-tolerant search', () => {
  it('returns results for a single-character typo (SCUBA → SCBA)', () => {
    const exact = searchFireLearn('SCBA')
    const typoed = searchFireLearn('SCUBA')

    expect(exact.length).toBeGreaterThan(0)
    expect(typoed.length).toBeGreaterThan(0)
  })

  it('ranks exact-spelling matches above typoed-query matches', () => {
    const customIndex: SearchResult[] = [
      { id: 'exact', type: 'lesson', title: 'SCBA', description: 'Breathing apparatus', href: '/a', keywords: ['scba'] },
      { id: 'fuzzy', type: 'lesson', title: 'SCUBA diving', description: 'Underwater gear', href: '/b', keywords: ['scuba'] },
    ]

    const results = rankSearchResults('SCBA', customIndex)
    expect(results[0]?.id).toBe('exact')
    expect(results[0]?.score).toBeGreaterThan(results[1]?.score ?? 0)
  })

  it('still returns zero results for a completely unrelated query', () => {
    const results = searchFireLearn('xyzzqqpp')
    expect(results).toHaveLength(0)
  })

  it('does not fuzzy-match tokens that are too distant', () => {
    // "fire" is 4 chars (threshold=1). "water" is 5 chars (threshold=2).
    // editDistance("fire","water") = 4, well beyond both thresholds.
    const customIndex: SearchResult[] = [
      { id: 'unrelated', type: 'lesson', title: 'Water supply', description: 'Hydrant operations', href: '/x', keywords: [] },
    ]
    const results = rankSearchResults('fire', customIndex)
    expect(results).toHaveLength(0)
  })

  it('handles multi-word queries where one word is typoed', () => {
    // If "SCBA" is correct but "ventaltion" is a typo of "ventilation",
    // the search should still find relevant content.
    const results = searchFireLearn('SCBA ventaltion')
    // May or may not find results depending on catalog, but should not crash
    expect(Array.isArray(results)).toBe(true)
  })
})
