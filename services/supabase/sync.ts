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

function lessonCompletionPayload(item: SyncQueueItem, userId: string) {
  return {
    user_id: userId,
    lesson_id: String(item.payload.lessonId),
    course_id: String(item.payload.courseId),
    xp_awarded: Number(item.payload.xpAwarded ?? 0),
    client_mutation_id: item.id,
  }
}

function quizAttemptPayload(item: SyncQueueItem, userId: string) {
  return {
    user_id: userId,
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

function flashcardReviewPayload(item: SyncQueueItem, userId: string) {
  return {
    user_id: userId,
    card_id: String(item.payload.cardId),
    rating: String(item.payload.rating),
    ease_factor: Number(item.payload.easeFactor ?? 2.5),
    interval_days: Number(item.payload.intervalDays ?? 0),
    review_count: Number(item.payload.reviewCount ?? 0),
    next_review: String(item.payload.nextReview ?? new Date().toISOString()),
    reviewed_at: String(item.payload.reviewedAt ?? new Date().toISOString()),
    client_mutation_id: item.id,
  }
}

async function replayItem(client: MinimalSupabaseSyncClient, item: SyncQueueItem, userId: string): Promise<SupabaseMutationResult> {
  if (item.entity === 'lesson_completion') {
    return normalizeMutationResult(client.from('lesson_completions').upsert(lessonCompletionPayload(item, userId), { onConflict: 'user_id,lesson_id' }))
  }

  if (item.entity === 'quiz_attempt') {
    return normalizeMutationResult(client.from('quiz_attempts').insert(quizAttemptPayload(item, userId)))
  }

  if (item.entity === 'flashcard_review') {
    return normalizeMutationResult(client.from('flashcard_reviews').insert(flashcardReviewPayload(item, userId)))
  }

  return { error: { message: `Unsupported sync entity: ${item.entity}` } }
}

export async function replaySyncQueueToSupabase(client: MinimalSupabaseSyncClient, queue: SyncQueueItem[], userId: string): Promise<SyncReplayResult> {
  const syncedIds: string[] = []
  const failed: SyncReplayResult['failed'] = []

  for (const item of queue.filter((queueItem) => queueItem.status === 'pending')) {
    const result = await replayItem(client, item, userId)
    if (result.error) {
      failed.push({ id: item.id, message: result.error.message })
    } else {
      syncedIds.push(item.id)
    }
  }

  return { syncedIds, failed }
}
