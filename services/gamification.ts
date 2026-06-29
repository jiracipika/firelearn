export type LeaderboardEntry = {
  id: string
  name: string
  company: string
  xp: number
  streakDays: number
  completedLessons: number
  perfectQuizzes: number
}

export type RankedLeaderboardEntry = LeaderboardEntry & { rank: number }

export type WeeklyChallenge = {
  id: string
  title: string
  description: string
  goal: number
  progress: number
  xpReward: number
}

export type AchievementProgress = {
  id: string
  title: string
  description: string
  unlocked: boolean
  progress: number
  goal: number
}

export function buildLeaderboard(entries: LeaderboardEntry[]): RankedLeaderboardEntry[] {
  return [...entries]
    .sort((a, b) => b.xp - a.xp || b.streakDays - a.streakDays || b.completedLessons - a.completedLessons || a.name.localeCompare(b.name))
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
}

export function getLearnerRank(entries: LeaderboardEntry[], learnerId: string) {
  return buildLeaderboard(entries).find((entry) => entry.id === learnerId)?.rank
}

export function getActiveChallenges(challenges: WeeklyChallenge[]) {
  return challenges.filter((challenge) => challenge.progress < challenge.goal)
}

export function summarizeAchievements(achievements: AchievementProgress[]) {
  return achievements.map((achievement) => ({
    id: achievement.id,
    title: achievement.title,
    percent: Math.min(100, Math.round((achievement.progress / achievement.goal) * 100)),
    unlocked: achievement.unlocked,
  }))
}
