import { describe, expect, it } from 'vitest'
import {
  aggregateLearnerStats,
  XP_PER_QUIZ_PERFECT,
  type LearnerActivity,
} from '@/services/gamification-aggregator'

const baseActivity: LearnerActivity = {
  completedLessons: [],
  quizAttempts: [],
  flashcardsReviewed: 0,
}

describe('aggregateLearnerStats', () => {
  it('awards XP for each completed lesson', () => {
    const stats = aggregateLearnerStats({
      ...baseActivity,
      completedLessons: [{ lessonId: 'l1', courseId: 'c1', xpAwarded: 50 }],
    })
    expect(stats.xp).toBe(50)
  })

  it('awards XP for perfect quiz scores', () => {
    const stats = aggregateLearnerStats({
      ...baseActivity,
      quizAttempts: [
        { quizId: 'q1', scorePercent: 100, weakTopicIds: [], completedAt: '2026-01-01T00:00:00Z' },
        { quizId: 'q2', scorePercent: 80, weakTopicIds: [], completedAt: '2026-01-01T00:00:00Z' },
      ],
    })
    expect(stats.xp).toBe(XP_PER_QUIZ_PERFECT)
  })

  it('computes level from total XP', () => {
    const stats = aggregateLearnerStats({
      ...baseActivity,
      completedLessons: [
        { lessonId: 'l1', courseId: 'c1', xpAwarded: 300 },
        { lessonId: 'l2', courseId: 'c1', xpAwarded: 300 },
        { lessonId: 'l3', courseId: 'c1', xpAwarded: 300 },
      ],
    })
    expect(stats.level).toBe(Math.floor(900 / 750) + 1)
  })

  it('updates weekly challenge progress from real activity', () => {
    const stats = aggregateLearnerStats(
      {
        ...baseActivity,
        completedLessons: [{ lessonId: 'l1', courseId: 'reading-smoke-and-fire-growth', xpAwarded: 50 }],
        flashcardsReviewed: 25,
        quizAttempts: [{ quizId: 'q1', scorePercent: 100, weakTopicIds: [], completedAt: '2026-01-01T00:00:00Z' }],
      },
      ['smoke-reading-sprint', 'scba-review-block', 'perfect-company-quiz'],
    )
    const challengeMap = new Map(stats.challenges.map((c) => [c.id, c]))
    expect(challengeMap.get('smoke-reading-sprint')?.progress).toBe(1)
    expect(challengeMap.get('scba-review-block')?.progress).toBe(25)
    expect(challengeMap.get('perfect-company-quiz')?.progress).toBe(1)
  })

  it('unlocks achievements when thresholds are reached', () => {
    const stats = aggregateLearnerStats({
      ...baseActivity,
      quizAttempts: Array.from({ length: 10 }, (_, i) => ({
        quizId: `q${i}`,
        scorePercent: 100,
        weakTopicIds: [],
        completedAt: '2026-01-01T00:00:00Z',
      })),
    })
    const quizMaster = stats.achievements.find((a) => a.id === 'quiz-master-10')
    expect(quizMaster?.unlocked).toBe(true)
    expect(quizMaster?.progress).toBe(10)
  })

  it('counts perfect quizzes', () => {
    const stats = aggregateLearnerStats({
      ...baseActivity,
      quizAttempts: [
        { quizId: 'q1', scorePercent: 100, weakTopicIds: [], completedAt: '2026-01-01T00:00:00Z' },
        { quizId: 'q2', scorePercent: 100, weakTopicIds: [], completedAt: '2026-01-01T00:00:00Z' },
        { quizId: 'q3', scorePercent: 75, weakTopicIds: ['fire-behaviour'], completedAt: '2026-01-01T00:00:00Z' },
      ],
    })
    expect(stats.perfectQuizzes).toBe(2)
  })

  it('uses learner streak days for streak achievement progress', () => {
    const stats = aggregateLearnerStats({
      ...baseActivity,
      streakDays: 23,
    })
    const streakAchievement = stats.achievements.find((achievement) => achievement.id === 'streak-30')
    expect(streakAchievement?.progress).toBe(23)
    expect(streakAchievement?.unlocked).toBe(false)
  })

  it('computes leaderboard entry with dynamic XP replacing seed value', () => {
    const stats = aggregateLearnerStats({
      ...baseActivity,
      completedLessons: [
        { lessonId: 'l1', courseId: 'c1', xpAwarded: 200 },
        { lessonId: 'l2', courseId: 'c1', xpAwarded: 150 },
      ],
      quizAttempts: [{ quizId: 'q1', scorePercent: 100, weakTopicIds: [], completedAt: '2026-01-01T00:00:00Z' }],
    })
    expect(stats.xp).toBe(200 + 150 + XP_PER_QUIZ_PERFECT)
    expect(stats.completedLessons).toBe(2)
    expect(stats.perfectQuizzes).toBe(1)
  })
})
