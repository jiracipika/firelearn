import { describe, expect, it } from 'vitest'
import { academyCourses } from '@/data/academy'
import { flattenCourseLessons, getLessonPracticeHref, getLessonSequence } from '@/services/lesson-navigation'

describe('lesson navigation', () => {
  it('flattens lessons in module order', () => {
    const course = academyCourses[0]
    const lessons = flattenCourseLessons(course)

    expect(lessons.length).toBeGreaterThan(1)
    expect(lessons[0].id).toBe(course.modules[0].lessons[0].id)
  })

  it('returns previous and next lessons for a middle lesson', () => {
    const course = academyCourses[0]
    const lessons = flattenCourseLessons(course)
    const sequence = getLessonSequence(course, lessons[1].id)

    expect(sequence.previous?.id).toBe(lessons[0].id)
    expect(sequence.current?.id).toBe(lessons[1].id)
    expect(sequence.next?.id).toBe(lessons[2]?.id)
    expect(sequence.total).toBe(lessons.length)
  })

  it('handles an unknown lesson id without throwing', () => {
    const sequence = getLessonSequence(academyCourses[0], 'missing-lesson')

    expect(sequence.index).toBe(-1)
    expect(sequence.current).toBeUndefined()
  })

  it('builds scoped practice links', () => {
    const course = academyCourses[0]
    const lesson = flattenCourseLessons(course)[0]

    expect(getLessonPracticeHref('quiz', course, lesson)).toBe(`/quiz?course=${course.slug}&lesson=${lesson.slug}`)
    expect(getLessonPracticeHref('flashcards', course, lesson)).toBe(`/flashcards?course=${course.slug}&lesson=${lesson.slug}`)
  })
})
