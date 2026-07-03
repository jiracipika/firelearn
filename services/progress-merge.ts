import type { QuizAttempt } from '@/services/local-persistence'

export function mergeCompletedLessonIds(primary: string[], secondary: string[]) {
  return Array.from(new Set([...primary, ...secondary]))
}

export function mergeQuizHistory(primary: QuizAttempt[], secondary: QuizAttempt[]) {
  const byAttempt = new Map<string, QuizAttempt>()

  for (const attempt of [...secondary, ...primary]) {
    byAttempt.set(`${attempt.quizId}:${attempt.completedAt}`, attempt)
  }

  return Array.from(byAttempt.values()).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
}
