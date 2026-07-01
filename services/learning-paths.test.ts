import { describe, expect, it } from 'vitest'
import { academyCourses } from '@/data/academy'
import { buildLearningPaths, chooseLearningPath } from '@/services/learning-paths'

describe('learning paths', () => {
  it('groups the academy catalog into category paths', () => {
    const paths = buildLearningPaths(academyCourses)

    expect(paths.length).toBeGreaterThan(1)
    expect(paths.every((path) => path.totalCourses > 0)).toBe(true)
    expect(paths.every((path) => path.steps.every((step) => step.categoryId === path.categoryId))).toBe(true)
  })

  it('sorts steps from easier to harder inside each path', () => {
    const paths = buildLearningPaths(academyCourses)
    const difficultyRank = { Recruit: 1, 'Firefighter I': 2, 'Firefighter II': 3, 'Company Officer': 4, Advanced: 5 }

    for (const path of paths) {
      const ranks = path.steps.map((step) => difficultyRank[step.difficulty])
      expect(ranks).toEqual(ranks.slice().sort((a, b) => a - b))
    }
  })

  it('marks completed courses and selects the first unfinished step', () => {
    const category = academyCourses[0].categoryId
    const categoryCourses = academyCourses.filter((course) => course.categoryId === category)
    const firstCourse = categoryCourses.slice().sort((a, b) => a.difficulty.localeCompare(b.difficulty))[0]
    const path = buildLearningPaths(academyCourses, [firstCourse.id]).find((item) => item.categoryId === category)

    expect(path?.completedCourses).toBe(1)
    expect(path?.nextStep?.courseId).not.toBe(firstCourse.id)
  })

  it('honors a preferred category when it still has unfinished work', () => {
    const preferredCategory = academyCourses.at(-1)?.categoryId
    const path = chooseLearningPath(academyCourses, preferredCategory)

    expect(path?.categoryId).toBe(preferredCategory)
    expect(path?.nextStep).toBeDefined()
  })
})
