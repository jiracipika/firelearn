import { describe, expect, it } from 'vitest'
import {
  buildLeaderboard,
  getActiveChallenges,
  getLearnerRank,
  summarizeAchievements,
  type LeaderboardEntry,
} from '@/services/gamification'

const entries: LeaderboardEntry[] = [
  { id: 'a', name: 'Maya Chen', company: 'Engine 4', xp: 4200, streakDays: 12, completedLessons: 18, perfectQuizzes: 4 },
  { id: 'b', name: 'Jordan Pike', company: 'Truck 2', xp: 6100, streakDays: 7, completedLessons: 21, perfectQuizzes: 2 },
  { id: 'c', name: 'Sam Rivera', company: 'Rescue 1', xp: 6100, streakDays: 15, completedLessons: 19, perfectQuizzes: 5 },
]

describe('gamification service', () => {
  it('ranks leaderboard by XP, then streak, then completed lessons', () => {
    expect(buildLeaderboard(entries).map((entry) => entry.id)).toEqual(['c', 'b', 'a'])
    expect(buildLeaderboard(entries)[0]?.rank).toBe(1)
  })

  it('returns a learner rank from the sorted leaderboard', () => {
    expect(getLearnerRank(entries, 'b')).toBe(2)
  })

  it('filters active weekly challenges by progress remaining', () => {
    const active = getActiveChallenges([
      { id: 'review', title: 'Review 40 cards', description: 'Clear the review queue', goal: 40, progress: 12, xpReward: 200 },
      { id: 'done', title: 'Complete 2 lessons', description: 'Finish two lessons', goal: 2, progress: 2, xpReward: 150 },
    ])

    expect(active).toEqual([{ id: 'review', title: 'Review 40 cards', description: 'Clear the review queue', goal: 40, progress: 12, xpReward: 200 }])
  })

  it('summarizes achievement progress with completion percentages', () => {
    expect(summarizeAchievements([
      { id: 'streak-30', title: '30-day streak', description: 'Study for 30 days', unlocked: false, progress: 23, goal: 30 },
    ])).toEqual([{ id: 'streak-30', title: '30-day streak', percent: 77, unlocked: false }])
  })
})
