import { describe, expect, it } from 'vitest'
import type { Flashcard } from '@/types/learning'
import { createMemoryStorage } from '@/services/local-persistence'
import {
  clearFlashcardReviewSession,
  loadFlashcardReviewSession,
  saveFlashcardReviewSession,
  type FlashcardReviewSessionSnapshot,
} from '@/services/flashcard-review-session'

const cards: Flashcard[] = [
  { id: 'card-1', front: 'First?', back: 'First answer', topicIds: ['fire-behavior'], difficulty: 'Recruit', easeFactor: 2.5, intervalDays: 0, nextReview: '2026-07-20T00:00:00.000Z', reviewCount: 0 },
  { id: 'card-2', front: 'Second?', back: 'Second answer', topicIds: ['size-up'], difficulty: 'Recruit', easeFactor: 2.5, intervalDays: 0, nextReview: '2026-07-20T00:00:00.000Z', reviewCount: 0 },
  { id: 'card-3', front: 'Third?', back: 'Third answer', topicIds: ['scba'], difficulty: 'Recruit', easeFactor: 2.5, intervalDays: 0, nextReview: '2026-07-20T00:00:00.000Z', reviewCount: 0 },
]

const snapshot: FlashcardReviewSessionSnapshot = {
  sessionId: 'global',
  reviewIds: ['card-1', 'card-2', 'card-3'],
  index: 1,
  reviewEvents: [{
    flashcardId: 'card-1',
    rating: 'good',
    reviewedAt: '2026-07-22T01:00:00.000Z',
    nextReview: '2026-07-23T01:00:00.000Z',
  }],
  updatedAt: '2026-07-22T01:00:00.000Z',
}

describe('flashcard review session persistence', () => {
  it('round-trips a valid in-progress session', () => {
    const storage = createMemoryStorage()
    expect(saveFlashcardReviewSession(storage, snapshot)).toBe(true)
    expect(loadFlashcardReviewSession(storage, 'global', cards, new Date('2026-07-22T02:00:00.000Z'))).toEqual(snapshot)
  })

  it('keeps lesson and global review sessions independent', () => {
    const storage = createMemoryStorage()
    saveFlashcardReviewSession(storage, snapshot)
    saveFlashcardReviewSession(storage, { ...snapshot, sessionId: 'course/lesson' })

    clearFlashcardReviewSession(storage, 'global')

    expect(loadFlashcardReviewSession(storage, 'global', cards)).toBeNull()
    expect(loadFlashcardReviewSession(storage, 'course/lesson', cards, new Date('2026-07-22T02:00:00.000Z'))).not.toBeNull()
  })

  it('rejects stale, corrupt, and catalog-incompatible sessions', () => {
    const staleStorage = createMemoryStorage()
    saveFlashcardReviewSession(staleStorage, snapshot)
    expect(loadFlashcardReviewSession(staleStorage, 'global', cards, new Date('2026-07-30T02:00:00.000Z'))).toBeNull()

    const corruptStorage = createMemoryStorage()
    corruptStorage.setItem('firelearn.flashcardSessions.v1', '{broken')
    expect(loadFlashcardReviewSession(corruptStorage, 'global', cards)).toBeNull()

    const changedCatalogStorage = createMemoryStorage()
    saveFlashcardReviewSession(changedCatalogStorage, snapshot)
    expect(loadFlashcardReviewSession(changedCatalogStorage, 'global', cards.slice(1))).toBeNull()
    expect(changedCatalogStorage.getItem('firelearn.flashcardSessions.v1')).toBeNull()
  })

  it('rejects impossible progress and tampered events', () => {
    const storage = createMemoryStorage()
    saveFlashcardReviewSession(storage, { ...snapshot, index: 2 })
    expect(loadFlashcardReviewSession(storage, 'global', cards)).toBeNull()

    saveFlashcardReviewSession(storage, { ...snapshot, reviewEvents: [{ ...snapshot.reviewEvents[0], flashcardId: 'card-2' }] })
    expect(loadFlashcardReviewSession(storage, 'global', cards)).toBeNull()

    saveFlashcardReviewSession(storage, { ...snapshot, reviewEvents: [{ ...snapshot.reviewEvents[0], rating: 'perfect' as 'good' }] })
    expect(loadFlashcardReviewSession(storage, 'global', cards)).toBeNull()
  })

  it('does not crash when browser storage is unavailable', () => {
    const unavailableStorage = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('quota exceeded') },
      removeItem: () => { throw new Error('blocked') },
    }

    expect(loadFlashcardReviewSession(unavailableStorage, 'global', cards)).toBeNull()
    expect(saveFlashcardReviewSession(unavailableStorage, snapshot)).toBe(false)
    expect(clearFlashcardReviewSession(unavailableStorage, 'global')).toBe(false)
  })
})
