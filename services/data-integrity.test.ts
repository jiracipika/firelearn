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
})
