import type { Course, Lesson } from '@/types/learning'

const SITE_ORIGIN = 'https://fflearn.vercel.app'

/**
 * Schema.org Course structured data for a FireLearn course detail page.
 * Enables rich results (course carousel, provider info) in search engines.
 */
export function courseJsonLd(course: Course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: `${SITE_ORIGIN}/courses/${course.slug}`,
    provider: {
      '@type': 'Organization',
      name: 'FireLearn',
      sameAs: SITE_ORIGIN,
      url: SITE_ORIGIN,
    },
    educationalLevel: course.difficulty,
    inLanguage: 'en',
    offers: {
      '@type': 'Offer',
      category: 'Free',
      price: '0',
      priceCurrency: 'USD',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      courseWorkload: `PT${course.estimatedMinutes}M`,
    },
  }
}

/**
 * Schema.org LearningResource structured data for a FireLearn lesson page.
 * Exposes objectives, difficulty, and estimated time to search engines.
 */
export function lessonJsonLd(course: Course, lesson: Lesson) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: lesson.title,
    description: lesson.videoPlaceholder,
    url: `${SITE_ORIGIN}/courses/${course.slug}/${lesson.slug}`,
    isPartOf: {
      '@type': 'Course',
      name: course.title,
      url: `${SITE_ORIGIN}/courses/${course.slug}`,
    },
    educationalLevel: lesson.difficulty,
    learningResourceType: 'InteractiveResource',
    teaches: lesson.objectives,
    timeRequired: `PT${lesson.estimatedMinutes}M`,
    inLanguage: 'en',
    provider: {
      '@type': 'Organization',
      name: 'FireLearn',
      sameAs: SITE_ORIGIN,
    },
  }
}
