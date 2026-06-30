import type { QuizAttempt } from '@/services/local-persistence'
import type { CompleteLessonInput } from '@/services/offline-progress'
import type { FireLearnSupabaseClient } from '@/services/supabase/client'

export type SupabaseProgressState = {
  authenticated: boolean
  completedLessonIds: string[]
  quizHistory: QuizAttempt[]
}

async function getUserId(client: FireLearnSupabaseClient) {
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) return undefined
  return data.user.id
}

export async function signInAnonymously(client: FireLearnSupabaseClient) {
  return client.auth.signInAnonymously()
}

export function formatSupabaseAuthError(error: { message?: string; code?: string; error_code?: string } | null | undefined) {
  if (!error) return undefined
  const code = error.code ?? error.error_code
  if (code === 'anonymous_provider_disabled' || error.message?.toLowerCase().includes('anonymous sign-ins are disabled')) {
    return 'Anonymous sign-ins are disabled for this Supabase project. Enable Authentication → Providers → Anonymous Sign-Ins for the project shown below, then redeploy or refresh.'
  }
  return error.message ?? 'Supabase authentication failed.'
}

export async function loadSupabaseProgress(client: FireLearnSupabaseClient): Promise<SupabaseProgressState> {
  const userId = await getUserId(client)
  if (!userId) return { authenticated: false, completedLessonIds: [], quizHistory: [] }

  const [lessonResult, quizResult] = await Promise.all([
    client.from('lesson_completions').select('lesson_id').eq('user_id', userId),
    client.from('quiz_attempts').select('quiz_id, score_percent, weak_topic_ids, completed_at').eq('user_id', userId).order('completed_at', { ascending: false }).limit(25),
  ])

  if (lessonResult.error) throw new Error(lessonResult.error.message)
  if (quizResult.error) throw new Error(quizResult.error.message)

  return {
    authenticated: true,
    completedLessonIds: (lessonResult.data ?? []).map((row) => row.lesson_id),
    quizHistory: (quizResult.data ?? []).map((row) => ({
      quizId: row.quiz_id,
      scorePercent: row.score_percent,
      weakTopicIds: row.weak_topic_ids ?? [],
      completedAt: row.completed_at,
    })),
  }
}

export async function completeLessonInSupabase(client: FireLearnSupabaseClient, input: CompleteLessonInput) {
  const userId = await getUserId(client)
  if (!userId) throw new Error('You must be signed in before saving lesson progress.')

  const { error } = await client.from('lesson_completions').upsert({
    user_id: userId,
    course_id: input.courseId,
    lesson_id: input.lessonId,
    xp_awarded: input.xpAwarded,
    completed_at: new Date().toISOString(),
  }, { onConflict: 'user_id,lesson_id' })

  if (error) throw new Error(error.message)
}

export async function recordQuizAttemptInSupabase(client: FireLearnSupabaseClient, attempt: QuizAttempt) {
  const userId = await getUserId(client)
  if (!userId) throw new Error('You must be signed in before saving quiz history.')

  const { error } = await client.from('quiz_attempts').insert({
    user_id: userId,
    quiz_id: attempt.quizId,
    score_percent: attempt.scorePercent,
    weak_topic_ids: attempt.weakTopicIds,
    completed_at: attempt.completedAt,
  })

  if (error) throw new Error(error.message)
}

export type FlashcardReviewRecord = {
  cardId: string
  rating: 'again' | 'hard' | 'good' | 'easy'
  easeFactor: number
  intervalDays: number
  reviewCount: number
  nextReview: string
  reviewedAt: string
}

export async function recordFlashcardReviewInSupabase(client: FireLearnSupabaseClient, review: FlashcardReviewRecord) {
  const userId = await getUserId(client)
  if (!userId) throw new Error('You must be signed in before saving flashcard reviews.')

  const { error } = await client.from('flashcard_reviews').insert({
    user_id: userId,
    card_id: review.cardId,
    rating: review.rating,
    ease_factor: review.easeFactor,
    interval_days: review.intervalDays,
    review_count: review.reviewCount,
    next_review: review.nextReview,
    reviewed_at: review.reviewedAt,
  })

  if (error) throw new Error(error.message)
}
