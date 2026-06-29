import { describe, expect, it } from 'vitest'
import { academyCourses } from '@/data/academy'
import { validateCourses } from '@/lib/content-validation'

describe('content validation', () => {
  it('accepts the shipped academy catalog', () => {
    expect(validateCourses(academyCourses)).toHaveLength(32)
  })

  it('rejects quiz answers that are not present in options', () => {
    const broken = structuredClone(academyCourses)
    broken[0].modules[0].lessons[0].quiz[0].correctAnswerIds = ['Not an option']

    expect(() => validateCourses(broken)).toThrow()
  })
})
