import { describe, expect, it } from 'vitest'
import { mergeCompletedLessonIds, mergeQuizHistory } from '@/services/progress-merge'

const attempt = (quizId: string, completedAt: string, scorePercent = 80) => ({
  quizId,
  completedAt,
  scorePercent,
  weakTopicIds: [],
})

describe('progress merge', () => {
  it('deduplicates local and Supabase lesson completions while preserving first-seen order', () => {
    expect(mergeCompletedLessonIds(['lesson-1', 'lesson-2'], ['lesson-2', 'lesson-3'])).toEqual([
      'lesson-1',
      'lesson-2',
      'lesson-3',
    ])
  })

  it('merges quiz history by quiz and timestamp with Supabase taking precedence', () => {
    const sharedLocal = attempt('quiz-a', '2026-07-01T10:00:00.000Z', 60)
    const sharedSupabase = attempt('quiz-a', '2026-07-01T10:00:00.000Z', 100)
    const merged = mergeQuizHistory(
      [sharedSupabase, attempt('quiz-b', '2026-07-03T10:00:00.000Z', 90)],
      [sharedLocal, attempt('quiz-c', '2026-07-02T10:00:00.000Z', 70)],
    )

    expect(merged.map((item) => item.quizId)).toEqual(['quiz-b', 'quiz-c', 'quiz-a'])
    expect(merged.find((item) => item.quizId === 'quiz-a')?.scorePercent).toBe(100)
  })
})
