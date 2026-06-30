import { describe, expect, it } from 'vitest'
import { academyCourses } from '@/data/academy'
import { computeCatalogMetrics, formatCatalogClaim } from '@/services/catalog-metrics'

describe('catalog metrics', () => {
  it('computes content counts from the live catalog', () => {
    const metrics = computeCatalogMetrics(academyCourses)

    expect(metrics.courseCount).toBe(academyCourses.length)
    expect(metrics.lessonCount).toBeGreaterThan(0)
    expect(metrics.questionCount).toBeGreaterThan(0)
    expect(metrics.flashcardCount).toBeGreaterThan(0)
    expect(metrics.referenceCount).toBeGreaterThan(0)
  })

  it('keeps public claims synchronized with computed metrics', () => {
    const metrics = computeCatalogMetrics(academyCourses)
    const claim = formatCatalogClaim(metrics)

    expect(claim).toContain(`${metrics.courseCount} courses`)
    expect(claim).toContain(`${metrics.lessonCount} lessons`)
    expect(claim).toContain(`${metrics.questionCount} quiz questions`)
    expect(claim).not.toMatch(/192 videos|29 disciplines/i)
  })
})
