import { describe, expect, it } from 'vitest'
import { createMemoryStorage, loadLearnerState } from '@/services/local-persistence'
import {
  createOfflineProgressRepository,
  getCourseProgressPercent,
  getWeakTopicSummary,
} from '@/services/offline-progress'

describe('offline progress repository', () => {
  it('marks lessons complete idempotently and awards XP once', () => {
    const storage = createMemoryStorage()
    const repo = createOfflineProgressRepository(storage)

    repo.completeLesson({ lessonId: 'lesson-1', courseId: 'course-1', xpAwarded: 50 })
    repo.completeLesson({ lessonId: 'lesson-1', courseId: 'course-1', xpAwarded: 50 })

    expect(loadLearnerState(storage)).toMatchObject({
      completedLessonIds: ['lesson-1'],
      xp: 50,
    })
  })

  it('queues sync operations for later Supabase replay', () => {
    const storage = createMemoryStorage()
    const repo = createOfflineProgressRepository(storage)

    repo.completeLesson({ lessonId: 'lesson-1', courseId: 'course-1', xpAwarded: 25 })

    expect(repo.getSyncQueue()).toEqual([
      expect.objectContaining({
        entity: 'lesson_completion',
        operation: 'upsert',
        payload: { lessonId: 'lesson-1', courseId: 'course-1', xpAwarded: 25 },
        status: 'pending',
      }),
    ])
  })

  it('computes course progress from completed lesson ids', () => {
    const percent = getCourseProgressPercent({
      lessonIds: ['a', 'b', 'c', 'd'],
      completedLessonIds: ['a', 'd'],
    })

    expect(percent).toBe(50)
  })

  it('summarizes weak topics from quiz history newest first', () => {
    const storage = createMemoryStorage()
    const repo = createOfflineProgressRepository(storage)
    repo.recordQuizAttempt({ quizId: 'quiz-1', scorePercent: 60, weakTopicIds: ['scba', 'mayday-procedures'], completedAt: '2026-06-28T00:00:00.000Z' })
    repo.recordQuizAttempt({ quizId: 'quiz-2', scorePercent: 80, weakTopicIds: ['scba'], completedAt: '2026-06-29T00:00:00.000Z' })

    expect(getWeakTopicSummary(repo.getQuizHistory())).toEqual([
      { topicId: 'scba', misses: 2 },
      { topicId: 'mayday-procedures', misses: 1 },
    ])
  })
})
