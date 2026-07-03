import { describe, expect, it } from 'vitest'
import { buildCompletedLessonAwards, getCourseLessonCount, getLessonXpAward, MIN_LESSON_XP } from '@/services/lesson-xp'
import type { Course } from '@/types/learning'

function lesson(id: string) {
  return {
    id,
    slug: id,
    title: id,
    difficulty: 'Recruit',
    estimatedMinutes: 10,
    objectives: [],
    prerequisites: [],
    content: [],
    imageAlt: '',
    videoPlaceholder: '',
    videos: [],
    knowledgeCheck: {
      id: `${id}-check`,
      type: 'multiple-choice',
      prompt: 'Prompt?',
      options: ['A'],
      correctAnswerIds: ['A'],
      explanation: 'Because.',
      topicIds: [],
    },
    summary: [],
    quiz: [],
    flashcards: [],
    references: [],
    completion: { completed: false, percent: 0 },
  } satisfies Course['modules'][number]['lessons'][number]
}

function course(overrides: Partial<Course> = {}): Course {
  return {
    id: 'course-fire-behaviour',
    slug: 'reading-smoke-and-fire-growth',
    title: 'Reading Smoke',
    description: 'Read smoke cues.',
    categoryId: 'fire-behaviour',
    difficulty: 'Recruit',
    estimatedMinutes: 60,
    progressPercent: 0,
    xp: 300,
    modules: [
      { id: 'module-1', title: 'Module 1', description: '', lessons: [lesson('lesson-1'), lesson('lesson-2')] },
    ],
    ...overrides,
  }
}

describe('lesson XP helpers', () => {
  it('counts lessons across every module', () => {
    const sample = course({
      modules: [
        { id: 'module-1', title: 'Module 1', description: '', lessons: [lesson('a'), lesson('b')] },
        { id: 'module-2', title: 'Module 2', description: '', lessons: [lesson('c')] },
      ],
    })

    expect(getCourseLessonCount(sample)).toBe(3)
  })

  it('allocates course XP across lessons instead of awarding full course XP per lesson', () => {
    expect(getLessonXpAward(course({ xp: 300 }))).toBe(150)
  })

  it('keeps a minimum award for short courses', () => {
    expect(getLessonXpAward(course({ xp: 10 }))).toBe(MIN_LESSON_XP)
  })

  it('builds completed lesson awards with slugs for challenge progress', () => {
    expect(buildCompletedLessonAwards([course()], ['lesson-1', 'missing'])).toEqual([
      { lessonId: 'lesson-1', courseId: 'reading-smoke-and-fire-growth', xpAwarded: 150 },
      { lessonId: 'missing', courseId: 'unknown', xpAwarded: MIN_LESSON_XP },
    ])
  })
})
