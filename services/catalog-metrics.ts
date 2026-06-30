import type { Course } from '@/types/learning'

export type CatalogMetrics = {
  courseCount: number
  lessonCount: number
  moduleCount: number
  questionCount: number
  flashcardCount: number
  videoCount: number
  referenceCount: number
  estimatedMinutes: number
}

export function computeCatalogMetrics(courses: Course[]): CatalogMetrics {
  return courses.reduce<CatalogMetrics>((metrics, course) => {
    metrics.courseCount += 1
    metrics.moduleCount += course.modules.length
    metrics.estimatedMinutes += course.estimatedMinutes

    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        metrics.lessonCount += 1
        metrics.questionCount += lesson.quiz.length
        metrics.flashcardCount += lesson.flashcards.length
        metrics.videoCount += lesson.videos.length
        metrics.referenceCount += lesson.references.length
      }
    }

    return metrics
  }, {
    courseCount: 0,
    lessonCount: 0,
    moduleCount: 0,
    questionCount: 0,
    flashcardCount: 0,
    videoCount: 0,
    referenceCount: 0,
    estimatedMinutes: 0,
  })
}

export function formatCatalogClaim(metrics: CatalogMetrics): string {
  return `${metrics.courseCount} courses · ${metrics.lessonCount} lessons · ${metrics.questionCount} quiz questions · ${metrics.flashcardCount} flashcards · ${metrics.videoCount} embedded videos`
}
