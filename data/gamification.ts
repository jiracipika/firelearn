import type { AchievementProgress, LeaderboardEntry, WeeklyChallenge } from '@/services/gamification'

export const leaderboardEntries: LeaderboardEntry[] = [
  { id: 'current-learner', name: 'You', company: 'Engine 7', xp: 9270, streakDays: 23, completedLessons: 31, perfectQuizzes: 7 },
  { id: 'maya-chen', name: 'Maya Chen', company: 'Engine 4', xp: 10420, streakDays: 18, completedLessons: 36, perfectQuizzes: 9 },
  { id: 'sam-rivera', name: 'Sam Rivera', company: 'Rescue 1', xp: 9810, streakDays: 27, completedLessons: 33, perfectQuizzes: 6 },
  { id: 'jordan-pike', name: 'Jordan Pike', company: 'Truck 2', xp: 8720, streakDays: 11, completedLessons: 28, perfectQuizzes: 8 },
  { id: 'noor-patel', name: 'Noor Patel', company: 'Squad 5', xp: 8430, streakDays: 14, completedLessons: 26, perfectQuizzes: 5 },
  { id: 'eli-brooks', name: 'Eli Brooks', company: 'Engine 2', xp: 7995, streakDays: 8, completedLessons: 25, perfectQuizzes: 4 },
]

export const weeklyChallenges: WeeklyChallenge[] = [
  { id: 'smoke-reading-sprint', title: 'Smoke Reading Sprint', description: 'Complete 3 fire behaviour lessons and score 80%+ on mixed practice.', goal: 3, progress: 1, xpReward: 250 },
  { id: 'scba-review-block', title: 'SCBA Review Block', description: 'Review 40 SCBA or Mayday flashcards this week.', goal: 40, progress: 18, xpReward: 300 },
  { id: 'perfect-company-quiz', title: 'Perfect Company Quiz', description: 'Earn one perfect quiz medal in practice or exam mode.', goal: 1, progress: 0, xpReward: 200 },
  { id: 'command-reps', title: 'Command Reps', description: 'Finish 2 incident command scenario questions.', goal: 2, progress: 2, xpReward: 150 },
]

export const achievementProgress: AchievementProgress[] = [
  { id: 'streak-30', title: '30-day streak', description: 'Study at least once per day for 30 days.', unlocked: false, progress: 23, goal: 30 },
  { id: 'quiz-master-10', title: 'Quiz Master', description: 'Earn 10 perfect quiz medals.', unlocked: false, progress: 7, goal: 10 },
  { id: 'academy-builder', title: 'Academy Builder', description: 'Complete 50 total lessons.', unlocked: false, progress: 31, goal: 50 },
  { id: 'air-management', title: 'Air Management Ready', description: 'Complete the SCBA course and pass its quiz.', unlocked: true, progress: 1, goal: 1 },
]
