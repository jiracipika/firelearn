import { createClient } from '@/lib/supabase/client'

export type QuizAttempt = {
  id: string
  quiz_id: string
  quiz_title: string
  score: number
  total_questions: number
  taken_at: string
}

export type CourseProgressRow = {
  course_id: string
  progress: number
  completed_lessons: number
  updated_at: string
}

export async function saveQuizAttempt(input: {
  quizId: string
  quizTitle: string
  score: number
  totalQuestions: number
}): Promise<{ error: string | null }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'not-authenticated' }

  const { error } = await supabase.from('quiz_attempts').insert({
    user_id: user.id,
    quiz_id: input.quizId,
    quiz_title: input.quizTitle,
    score: input.score,
    total_questions: input.totalQuestions,
  })
  return { error: error?.message ?? null }
}

export async function fetchQuizAttempts(): Promise<QuizAttempt[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('id, quiz_id, quiz_title, score, total_questions, taken_at')
    .order('taken_at', { ascending: false })
    .limit(20)

  if (error) return []
  return (data as QuizAttempt[]) ?? []
}

export async function saveCourseProgress(input: {
  courseId: string
  progress: number
  completedLessons: number
}): Promise<{ error: string | null }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'not-authenticated' }

  const { error } = await supabase.from('course_progress').upsert(
    {
      user_id: user.id,
      course_id: input.courseId,
      progress: input.progress,
      completed_lessons: input.completedLessons,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,course_id' },
  )
  return { error: error?.message ?? null }
}

export async function fetchCourseProgress(): Promise<CourseProgressRow[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('course_progress')
    .select('course_id, progress, completed_lessons, updated_at')

  if (error) return []
  return (data as CourseProgressRow[]) ?? []
}
