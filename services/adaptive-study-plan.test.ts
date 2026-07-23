import { describe, expect, it } from 'vitest'
import { buildAdaptiveStudyPlan } from '@/services/adaptive-study-plan'
import type { Course, Lesson } from '@/types/learning'

function lesson(id: string, topicIds: string[]): Lesson {
  return {
    id,
    slug: id,
    title: `Lesson ${id}`,
    difficulty: 'Firefighter I',
    estimatedMinutes: 15,
    objectives: [],
    prerequisites: [],
    content: [],
    imageAlt: '',
    videoPlaceholder: '',
    videos: [],
    knowledgeCheck: { id: `${id}-check`, type: 'multiple-choice', prompt: '', options: [], correctAnswerIds: [], explanation: '', topicIds },
    summary: [],
    quiz: [],
    flashcards: [],
    references: [],
    completion: { completed: false, percent: 0 },
  }
}

const courses: Course[] = [
  {
    id: 'fire', slug: 'fire', title: 'Fire', description: '', categoryId: 'fire-behaviour', difficulty: 'Firefighter I', estimatedMinutes: 30, progressPercent: 0, xp: 50,
    modules: [{ id: 'fire-module', title: '', description: '', lessons: [lesson('fire-complete', ['fire-behaviour']), lesson('fire-next', ['fire-behaviour'])] }],
  },
  {
    id: 'rescue', slug: 'rescue', title: 'Rescue', description: '', categoryId: 'search-and-rescue', difficulty: 'Firefighter I', estimatedMinutes: 15, progressPercent: 0, xp: 50,
    modules: [{ id: 'rescue-module', title: '', description: '', lessons: [lesson('rescue-next', ['search-and-rescue'])] }],
  },
]

describe('adaptive study plan', () => {
  it('prioritizes unfinished lessons that reinforce repeated quiz misses', () => {
    const plan = buildAdaptiveStudyPlan({
      courses,
      completedLessonIds: ['fire-complete'],
      quizHistory: [
        { quizId: 'one', scorePercent: 60, weakTopicIds: ['search-and-rescue'], completedAt: '2026-07-01T00:00:00Z' },
        { quizId: 'two', scorePercent: 65, weakTopicIds: ['search-and-rescue'], completedAt: '2026-07-02T00:00:00Z' },
      ],
    })

    expect(plan[0]).toMatchObject({
      lessonId: 'rescue-next',
      reason: 'reinforce-weak-topic',
      weakTopicIds: ['search-and-rescue'],
      href: '/courses/rescue/rescue-next',
    })
  })

  it('continues an in-progress course before suggesting an untouched course', () => {
    const plan = buildAdaptiveStudyPlan({ courses, completedLessonIds: ['fire-complete'], quizHistory: [] })

    expect(plan.map((item) => item.lessonId)).toEqual(['fire-next', 'rescue-next'])
    expect(plan[0]?.reason).toBe('continue-course')
    expect(plan[1]?.reason).toBe('start-course')
  })

  it('excludes completed lessons and respects the requested queue size', () => {
    const plan = buildAdaptiveStudyPlan({ courses, completedLessonIds: ['fire-complete'], quizHistory: [], limit: 1 })

    expect(plan).toHaveLength(1)
    expect(plan[0]?.lessonId).not.toBe('fire-complete')
  })

  it('returns no recommendations for a non-positive limit', () => {
    expect(buildAdaptiveStudyPlan({ courses, completedLessonIds: [], quizHistory: [], limit: 0 })).toEqual([])
  })
})
