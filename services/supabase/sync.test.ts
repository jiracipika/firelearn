import { describe, expect, it } from 'vitest'
import type { SyncQueueItem } from '@/services/offline-progress'
import { replaySyncQueueToSupabase, type MinimalSupabaseSyncClient } from '@/services/supabase/sync'

function makeItem(entity: SyncQueueItem['entity'], payload: Record<string, unknown>): SyncQueueItem {
  return {
    id: `${entity}-1`,
    entity,
    operation: entity === 'lesson_completion' ? 'upsert' : 'insert',
    payload,
    status: 'pending',
    createdAt: '2026-06-28T00:00:00.000Z',
  }
}

describe('Supabase sync adapter', () => {
  it('replays lesson completions with upsert semantics', async () => {
    const calls: Array<{ table: string; method: string; payload: unknown }> = []
    const client: MinimalSupabaseSyncClient = {
      from(table) {
        return {
          upsert(payload) {
            calls.push({ table, method: 'upsert', payload })
            return { error: null }
          },
          insert(payload) {
            calls.push({ table, method: 'insert', payload })
            return { error: null }
          },
        }
      },
    }

    const result = await replaySyncQueueToSupabase(client, [makeItem('lesson_completion', { lessonId: 'lesson-1', courseId: 'course-1', xpAwarded: 25 })])

    expect(result.syncedIds).toEqual(['lesson_completion-1'])
    expect(calls).toEqual([
      {
        table: 'lesson_completions',
        method: 'upsert',
        payload: {
          lesson_id: 'lesson-1',
          course_id: 'course-1',
          xp_awarded: 25,
          client_mutation_id: 'lesson_completion-1',
        },
      },
    ])
  })

  it('keeps failed queue items pending for retry', async () => {
    const client: MinimalSupabaseSyncClient = {
      from() {
        return {
          upsert() {
            return { error: { message: 'network down' } }
          },
          insert() {
            return { error: { message: 'network down' } }
          },
        }
      },
    }

    const result = await replaySyncQueueToSupabase(client, [makeItem('quiz_attempt', { quizId: 'quiz-1', scorePercent: 80, weakTopicIds: ['scba'], completedAt: '2026-06-28T00:00:00.000Z' })])

    expect(result.syncedIds).toEqual([])
    expect(result.failed).toEqual([{ id: 'quiz_attempt-1', message: 'network down' }])
  })
})
