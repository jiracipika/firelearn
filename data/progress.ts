import type { LearnerProgress } from '@/types/learning'

/**
 * Default empty learner progress.
 * All real values are computed from actual activity (Supabase + localStorage).
 * Never hardcode fake progress — start from zero.
 */
export const learnerProgress: LearnerProgress = {
  streakDays: 0,
  xp: 0,
  level: 1,
  dailyGoalMinutes: 25,
  minutesStudiedToday: 0,
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  achievements: [],
}
