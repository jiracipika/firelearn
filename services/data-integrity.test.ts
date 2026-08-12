import { describe, expect, it } from 'vitest'
import { restoreExportedData, validateExportedData, validateStorageIntegrity } from '@/services/data-integrity'
import { createMemoryStorage } from '@/services/local-persistence'

describe('data integrity validation', () => {
  it('accepts a well-formed export', () => {
    const valid = {
      exportedAt: '2026-06-30T12:00:00.000Z',
      'firelearn.learnerState.v1': {
        completedLessonIds: [],
        dailyGoalMinutes: 25,
        xp: 100,
        streakDays: 1,
      },
      'firelearn.quizHistory.v1': [
        { quizId: 'q1', scorePercent: 80, weakTopicIds: [], completedAt: '2026-06-30T12:00:00.000Z' },
      ],
      'firelearn.studyActivity.v1': [
        { id: 'a1', kind: 'quiz_complete', minutes: 5, createdAt: '2026-06-30T12:00:00.000Z' },
      ],
    }

    const result = validateExportedData(valid)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects non-object root', () => {
    expect(validateExportedData('not-an-object').valid).toBe(false)
    expect(validateExportedData(null).valid).toBe(false)
    expect(validateExportedData(42).valid).toBe(false)
  })

  it('reports missing learnerState fields', () => {
    const result = validateExportedData({
      'firelearn.learnerState.v1': { streakDays: 1 },
    })

    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('dailyGoalMinutes'))).toBe(true)
    expect(result.errors.some((e) => e.includes('completedLessonIds'))).toBe(true)
  })

  it('reports invalid quizHistory entries', () => {
    const result = validateExportedData({
      'firelearn.quizHistory.v1': [{ quizId: 123 }],
    })

    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('quizId must be a string'))).toBe(true)
  })

  it('reports invalid studyActivity kinds', () => {
    const result = validateExportedData({
      'firelearn.studyActivity.v1': [{ kind: 'invalid_kind', minutes: 5, createdAt: '2026-06-30T12:00:00.000Z' }],
    })

    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('kind is invalid'))).toBe(true)
  })

  it('rejects malformed flashcards, sync items, timer state, and non-finite metrics', () => {
    const result = validateExportedData({
      'firelearn.learnerState.v1': {
        completedLessonIds: ['lesson-1'], dailyGoalMinutes: 25, xp: Number.NaN, streakDays: 1,
      },
      'firelearn.flashcards.v1': {
        'card-1': { id: 'different-card', front: 'Question', back: 'Answer', topicIds: [], difficulty: 'Unknown', easeFactor: 0, intervalDays: -1, reviewCount: 0, nextReview: 'not-a-date' },
      },
      'firelearn.syncQueue.v1': [
        { id: 'item-1', entity: 'unknown', operation: 'insert', status: 'pending', payload: {}, createdAt: 'not-a-date' },
      ],
      'firelearn.studyTimer.v1': { startedAt: null, accumulatedSeconds: -1 },
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.stringContaining('xp must be a non-negative finite number'),
      expect.stringContaining('id must match its storage key'),
      expect.stringContaining('syncQueue[0].entity is invalid'),
      expect.stringContaining('studyTimer.accumulatedSeconds'),
    ]))
  })

  it('validates real storage integrity', () => {
    const storage = createMemoryStorage()
    const result = validateStorageIntegrity(storage)

    // Empty storage should be valid (null fields are acceptable)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('detects corrupted storage entries', () => {
    const storage = createMemoryStorage()
    storage.setItem('firelearn.quizHistory.v1', '{broken json')

    const result = validateStorageIntegrity(storage)
    expect(result.valid).toBe(false)
  })

  it('restores validated progress without copying unknown keys', () => {
    const storage = createMemoryStorage()
    const result = restoreExportedData(storage, {
      exportedAt: '2026-06-30T12:00:00.000Z',
      'firelearn.learnerState.v1': {
        completedLessonIds: ['lesson-1'],
        dailyGoalMinutes: 25,
        xp: 100,
        streakDays: 1,
      },
      'firelearn.quizHistory.v1': [],
      'firelearn.studyActivity.v1': [],
      'untrusted.key': 'must not be restored',
    })

    expect(result).toEqual({ restoredKeys: 3 })
    expect(JSON.parse(storage.getItem('firelearn.learnerState.v1') ?? '')).toMatchObject({ xp: 100 })
    expect(storage.getItem('untrusted.key')).toBeNull()
  })

  it('leaves existing progress untouched when the import is invalid', () => {
    const storage = createMemoryStorage()
    storage.setItem('firelearn.learnerState.v1', JSON.stringify({
      completedLessonIds: ['existing'], dailyGoalMinutes: 25, xp: 50, streakDays: 2,
    }))

    expect(() => restoreExportedData(storage, {
      'firelearn.learnerState.v1': { completedLessonIds: 'not-an-array' },
    })).toThrow(/could not be restored/i)
    expect(JSON.parse(storage.getItem('firelearn.learnerState.v1') ?? '')).toMatchObject({ xp: 50 })
  })

  it('restores prior values when a storage write fails partway through', () => {
    const backing = createMemoryStorage()
    backing.setItem('firelearn.learnerState.v1', JSON.stringify({
      completedLessonIds: ['existing'], dailyGoalMinutes: 25, xp: 50, streakDays: 2,
    }))
    backing.setItem('firelearn.quizHistory.v1', JSON.stringify([]))
    let writes = 0
    const storage = {
      getItem: backing.getItem,
      removeItem: backing.removeItem,
      setItem(key: string, value: string) {
        writes += 1
        if (writes === 2) throw new Error('quota exceeded')
        backing.setItem(key, value)
      },
    }

    expect(() => restoreExportedData(storage, {
      'firelearn.learnerState.v1': { completedLessonIds: ['replacement'], dailyGoalMinutes: 30, xp: 100, streakDays: 3 },
      'firelearn.quizHistory.v1': [{ quizId: 'q1', scorePercent: 80, weakTopicIds: [], completedAt: '2026-06-30T12:00:00.000Z' }],
    })).toThrow(/quota exceeded/)
    expect(JSON.parse(backing.getItem('firelearn.learnerState.v1') ?? '')).toMatchObject({ completedLessonIds: ['existing'], xp: 50 })
    expect(JSON.parse(backing.getItem('firelearn.quizHistory.v1') ?? '')).toEqual([])
  })
})
