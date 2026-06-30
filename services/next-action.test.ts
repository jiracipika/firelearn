import { describe, expect, it } from 'vitest'
import { academyCourses } from '@/data/academy'
import { chooseNextAction } from '@/services/next-action'

const baseInput = {
  courses: academyCourses,
  completedLessonIds: [],
  quizHistory: [],
  weakTopicIds: [],
  dueFlashcardCount: 0,
}

describe('chooseNextAction', () => {
  it('starts new learners on the first available lesson', () => {
    const action = chooseNextAction(baseInput)

    expect(action.kind).toBe('lesson')
    expect(action.href).toMatch(/^\/courses\//)
    expect(action.priority).toBeGreaterThan(50)
  })

  it('prioritizes weak-topic quiz remediation above continuing lessons', () => {
    const topicId = academyCourses[0].modules[0].lessons[0].quiz[0].topicIds[0]
    const action = chooseNextAction({ ...baseInput, weakTopicIds: [topicId] })

    expect(action.kind).toBe('quiz')
    expect(action.href).toContain('/quiz?course=')
    expect(action.title).toContain(topicId)
  })

  it('prioritizes a large due flashcard queue when there are no weak topics', () => {
    const action = chooseNextAction({ ...baseInput, dueFlashcardCount: 12 })

    expect(action.kind).toBe('flashcards')
    expect(action.href).toBe('/flashcards')
  })

  it('falls back to browsing when every lesson is complete', () => {
    const completedLessonIds = academyCourses.flatMap((course) => course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)))
    const action = chooseNextAction({ ...baseInput, completedLessonIds })

    expect(action.kind).toBe('browse')
    expect(action.href).toBe('/courses')
  })
})
