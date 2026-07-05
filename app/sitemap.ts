import type { MetadataRoute } from 'next'
import { academyCourses } from '@/data/academy'
import { getAllLessons } from '@/lib/academy-selectors'

export const dynamic = 'force-static'

const SITE_ORIGIN = 'https://fflearn.vercel.app'

/**
 * Generates a complete sitemap covering:
 *  - top-level static routes (landing, dashboard, courses, quiz, flashcards, search, profile)
 *  - every course detail page
 *  - every lesson page
 *  - every course certificate page
 *
 * Courses and lessons are prioritized higher because they contain the
 * substantive, indexable training content.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_ORIGIN}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_ORIGIN}/courses`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_ORIGIN}/dashboard`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_ORIGIN}/quiz`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_ORIGIN}/flashcards`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_ORIGIN}/search`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_ORIGIN}/profile`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const courseRoutes: MetadataRoute.Sitemap = academyCourses.map((course) => ({
    url: `${SITE_ORIGIN}/courses/${course.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const certificateRoutes: MetadataRoute.Sitemap = academyCourses.map((course) => ({
    url: `${SITE_ORIGIN}/courses/${course.slug}/certificate`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.3,
  }))

  const lessonRoutes: MetadataRoute.Sitemap = getAllLessons().map(({ course, lesson }) => ({
    url: `${SITE_ORIGIN}/courses/${course.slug}/${lesson.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...courseRoutes, ...lessonRoutes, ...certificateRoutes]
}
