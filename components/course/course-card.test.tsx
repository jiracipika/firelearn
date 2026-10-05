import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { academyCourses } from '@/data/academy'
import { CourseCard } from '@/components/course/course-card'

const course = academyCourses[0]
const lessons = course.modules.flatMap(module => module.lessons)

function renderCard(completedLessonIds?: string[]) {
  return renderToStaticMarkup(React.createElement(CourseCard, { course, completedLessonIds }))
}

describe('course cards with saved progress', () => {
  it('shows an unstarted course without using seeded catalog progress', () => {
    const html = renderCard()
    expect(html).toContain(`href="/courses/${course.slug}"`)
    expect(html).toContain('View course')
    expect(html).not.toContain('role="progressbar"')
  })

  it('resumes the next lesson using only completion IDs from this course', () => {
    const html = renderCard([lessons[0].id, lessons[0].id, 'unrelated-lesson'])
    expect(html).toContain(`href="/courses/${course.slug}/${lessons[1].slug}"`)
    expect(html).toContain('Continue course')
    expect(html).toContain(`1 of ${lessons.length} completed`)
    expect(html).toContain(`aria-valuenow="${100 / lessons.length}"`)
  })

  it('opens the course overview for a completed course', () => {
    const html = renderCard(lessons.map(lesson => lesson.id))
    expect(html).toContain(`href="/courses/${course.slug}"`)
    expect(html).toContain('Revisit course')
    expect(html).toContain('aria-valuenow="100"')
  })
})
