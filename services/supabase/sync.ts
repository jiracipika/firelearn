import type { SyncQueueItem } from '@/services/offline-progress'

export type SupabaseMutationResult = { error: { message: string } | null }

export type MinimalSupabaseSyncClient = {
  from: (table: string) => {
    upsert: (payload: Record<string, unknown>, options?: Record<string, unknown>) => unknown
    insert: (payload: Record<string, unknown>) => unknown
  }
}

export type SyncReplayResult = {
  syncedIds: string[]
  failed: Array<{ id: string; message: string }>
}

function lessonCompletionPayload(item: SyncQueueItem) {
  return {
    lesson_id: String(item.payload.lessonId),
    course_id: String(item.payload.courseId),
    xp_awarded: Number(item.payload.xpAwarded ?? 0),
    client_mutation_id: item.id,
  }
}

function quizAttemptPayload(item: SyncQueueItem) {
  return {
    quiz_id: String(item.payload.quizId),
    score_percent: Number(item.payload.scorePercent ?? 0),
    weak_topic_ids: Array.isArray(item.payload.weakTopicIds) ? item.payload.weakTopicIds : [],
    completed_at: String(item.payload.completedAt),
    client_mutation_id: item.id,
  }
}

async function normalizeMutationResult(result: unknown): Promise<SupabaseMutationResult> {
  const awaited = await result as Partial<SupabaseMutationResult> | undefined
  return { error: awaited?.error ?? null }
}

async function replayItem(client: MinimalSupabaseSyncClient, item: SyncQueueItem): Promise<SupabaseMutationResult> {
  if (item.entity === 'lesson_completion') {
    return normalizeMutationResult(client.from('lesson_completions').upsert(lessonCompletionPayload(item), { onConflict: 'user_id,lesson_id' }))
  }

  if (item.entity === 'quiz_attempt') {
    return normalizeMutationResult(client.from('quiz_attempts').insert(quizAttemptPayload(item)))
  }

  return { error: { message: `Unsupported sync entity: ${item.entity}` } }
}

export async function replaySyncQueueToSupabase(client: MinimalSupabaseSyncClient, queue: SyncQueueItem[]): Promise<SyncReplayResult> {
  const syncedIds: string[] = []
  const failed: SyncReplayResult['failed'] = []

  for (const item of queue.filter((queueItem) => queueItem.status === 'pending')) {
    const result = await replayItem(client, item)
    if (result.error) {
      failed.push({ id: item.id, message: result.error.message })
    } else {
      syncedIds.push(item.id)
    }
  }

  return { syncedIds, failed }
}
