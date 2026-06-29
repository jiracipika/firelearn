import { describe, expect, it } from 'vitest'
import { completeLessonInSupabase, formatSupabaseAuthError, loadSupabaseProgress, recordQuizAttemptInSupabase } from '@/services/supabase/progress'
import type { FireLearnSupabaseClient } from '@/services/supabase/client'

function createFakeClient() {
  const calls: Array<{ table: string; method: string; payload?: unknown }> = []
  const client = {
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }),
      signInAnonymously: async () => ({ data: {}, error: null }),
    },
    from(table: string) {
      return {
        upsert(payload: unknown) {
          calls.push({ table, method: 'upsert', payload })
          return Promise.resolve({ error: null })
        },
        insert(payload: unknown) {
          calls.push({ table, method: 'insert', payload })
          return Promise.resolve({ error: null })
        },
        select() {
          return {
            eq() {
              if (table === 'lesson_completions') return Promise.resolve({ data: [{ lesson_id: 'lesson-1' }], error: null })
              return {
                order() {
                  return {
                    limit() {
                      return Promise.resolve({ data: [{ quiz_id: 'quiz-1', score_percent: 90, weak_topic_ids: ['scba'], completed_at: '2026-06-28T00:00:00.000Z' }], error: null })
                    },
                  }
                },
              }
            },
          }
        },
      }
    },
  }
  return { client: client as unknown as FireLearnSupabaseClient, calls }
}

describe('Supabase progress service', () => {
  it('loads completed lessons and quiz history for the signed-in user', async () => {
    const { client } = createFakeClient()

    await expect(loadSupabaseProgress(client)).resolves.toEqual({
      authenticated: true,
      completedLessonIds: ['lesson-1'],
      quizHistory: [{ quizId: 'quiz-1', scorePercent: 90, weakTopicIds: ['scba'], completedAt: '2026-06-28T00:00:00.000Z' }],
    })
  })

  it('upserts lesson completion rows', async () => {
    const { client, calls } = createFakeClient()

    await completeLessonInSupabase(client, { courseId: 'course-1', lessonId: 'lesson-1', xpAwarded: 50 })

    expect(calls[0]).toMatchObject({ table: 'lesson_completions', method: 'upsert' })
  })

  it('inserts quiz attempts', async () => {
    const { client, calls } = createFakeClient()

    await recordQuizAttemptInSupabase(client, { quizId: 'quiz-1', scorePercent: 90, weakTopicIds: [], completedAt: '2026-06-28T00:00:00.000Z' })

    expect(calls[0]).toMatchObject({ table: 'quiz_attempts', method: 'insert' })
  })

  it('formats disabled anonymous-auth errors with actionable guidance', () => {
    expect(formatSupabaseAuthError({ error_code: 'anonymous_provider_disabled', message: 'Anonymous sign-ins are disabled' })).toContain('Authentication → Providers → Anonymous Sign-Ins')
  })
})
