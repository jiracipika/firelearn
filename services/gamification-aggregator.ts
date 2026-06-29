import type { QuizAttempt } from '@/services/local-persistence'
import type { AchievementProgress, WeeklyChallenge } from '@/services/gamification'
import { achievementProgress, weeklyChallenges } from '@/data/gamification'

export const XP_PER_LESSON = 50
export const XP_PER_QUIZ_PERFECT = 100

const XP_PER_LEVEL = 750

export type CompletedLesson = {
  lessonId: string
  courseId: string
  xpAwarded: number
}

export type LearnerActivity = {
  completedLessons: CompletedLesson[]
  quizAttempts: QuizAttempt[]
  flashcardsReviewed: number
  streakDays?: number
}

export type AggregatedStats = {
  xp: number
  level: number
  completedLessons: number
  perfectQuizzes: number
  challenges: WeeklyChallenge[]
  achievements: AchievementProgress[]
}

function countPerfectQuizzes(attempts: QuizAttempt[]): number {
  return attempts.filter((attempt) => attempt.scorePercent === 100).length
}

/**
 * Re-compute weekly challenge progress from real activity.
 *
 * Challenge IDs are mapped to activity signals:
 * - smoke-reading-sprint: lessons in the reading-smoke course
 * - scba-review-block: total flashcards reviewed
 * - perfect-company-quiz: perfect quiz count
 * - command-reps: lessons in the incident-command course
 */
function computeChallengeProgress(activity: LearnerActivity, challenges: WeeklyChallenge[]): WeeklyChallenge[] {
  const perfectQuizzes = countPerfectQuizzes(activity.quizAttempts)
  const smokeLessons = activity.completedLessons.filter((lesson) => lesson.courseId === 'reading-smoke-and-fire-growth').length
  const commandLessons = activity.completedLessons.filter((lesson) => lesson.courseId === 'incident-command-foundations').length

  const progressMap: Record<string, number> = {
    'smoke-reading-sprint': smokeLessons,
    'scba-review-block': activity.flashcardsReviewed,
    'perfect-company-quiz': perfectQuizzes,
    'command-reps': commandLessons,
  }

  return challenges.map((challenge) => ({
    ...challenge,
    progress: progressMap[challenge.id] ?? challenge.progress,
  }))
}

function computeAchievements(activity: LearnerActivity, achievements: AchievementProgress[]): AchievementProgress[] {
  const perfectQuizzes = countPerfectQuizzes(activity.quizAttempts)
  const completedCount = activity.completedLessons.length

  const progressMap: Record<string, number> = {
    'quiz-master-10': perfectQuizzes,
    'academy-builder': completedCount,
    'air-management': activity.completedLessons.some((lesson) => lesson.courseId === 'scba-air-management') ? 1 : 0,
    'streak-30': activity.streakDays ?? achievementProgress.find((achievement) => achievement.id === 'streak-30')?.progress ?? 0,
  }

  return achievements.map((achievement) => {
    const realProgress = progressMap[achievement.id] ?? achievement.progress
    return {
      ...achievement,
      progress: realProgress,
      unlocked: achievement.unlocked || realProgress >= achievement.goal,
    }
  })
}

export function aggregateLearnerStats(
  activity: LearnerActivity,
  challengeIds?: string[],
): AggregatedStats {
  const lessonXp = activity.completedLessons.reduce((sum, lesson) => sum + lesson.xpAwarded, 0)
  const quizXp = countPerfectQuizzes(activity.quizAttempts) * XP_PER_QUIZ_PERFECT
  const xp = lessonXp + quizXp
  const level = Math.floor(xp / XP_PER_LEVEL) + 1

  const baseChallenges = challengeIds
    ? weeklyChallenges.filter((challenge) => challengeIds.includes(challenge.id))
    : weeklyChallenges

  return {
    xp,
    level,
    completedLessons: activity.completedLessons.length,
    perfectQuizzes: countPerfectQuizzes(activity.quizAttempts),
    challenges: computeChallengeProgress(activity, baseChallenges),
    achievements: computeAchievements(activity, achievementProgress),
  }
}
