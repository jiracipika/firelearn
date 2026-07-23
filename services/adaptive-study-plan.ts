import type { Course, Lesson } from '@/types/learning'
import type { QuizAttempt } from '@/services/local-persistence'

export type StudyRecommendationReason = 'reinforce-weak-topic' | 'continue-course' | 'start-course'

export type StudyRecommendation = {
  lessonId: string
  lessonTitle: string
  courseId: string
  courseTitle: string
  href: string
  reason: StudyRecommendationReason
  topicIds: string[]
  weakTopicIds: string[]
}

type LessonWithCourse = {
  course: Course
  lesson: Lesson
  position: number
}

function getLessonTopics(lesson: Lesson) {
  return [...new Set([
    ...lesson.knowledgeCheck.topicIds,
    ...lesson.quiz.flatMap((question) => question.topicIds),
    ...lesson.flashcards.flatMap((card) => card.topicIds),
  ])]
}

function allLessons(courses: Course[]): LessonWithCourse[] {
  let position = 0
  return courses.flatMap((course) => course.modules.flatMap((module) => module.lessons.map((lesson) => ({
    course,
    lesson,
    position: position++,
  }))))
}

function weakTopicCounts(quizHistory: QuizAttempt[]) {
  const counts = new Map<string, number>()
  quizHistory.forEach((attempt) => {
    attempt.weakTopicIds.forEach((topicId) => counts.set(topicId, (counts.get(topicId) ?? 0) + 1))
  })
  return counts
}

/**
 * Produces a short, deterministic study queue from persisted learner activity.
 * It deliberately recommends unfinished lessons only: completed content remains
 * available through normal course navigation and flashcard review.
 */
export function buildAdaptiveStudyPlan({
  courses,
  completedLessonIds,
  quizHistory,
  limit = 3,
}: {
  courses: Course[]
  completedLessonIds: string[]
  quizHistory: QuizAttempt[]
  limit?: number
}): StudyRecommendation[] {
  if (limit <= 0) return []

  const completed = new Set(completedLessonIds)
  const lessons = allLessons(courses).filter(({ lesson }) => !completed.has(lesson.id))
  const weakCounts = weakTopicCounts(quizHistory)
  const courseHasProgress = new Set(
    allLessons(courses)
      .filter(({ lesson }) => completed.has(lesson.id))
      .map(({ course }) => course.id),
  )

  return lessons
    .map(({ course, lesson, position }) => {
      const topicIds = getLessonTopics(lesson)
      const weakTopicIds = topicIds.filter((topicId) => weakCounts.has(topicId))
      const weaknessScore = weakTopicIds.reduce((total, topicId) => total + (weakCounts.get(topicId) ?? 0), 0)
      const reason: StudyRecommendationReason = weaknessScore > 0
        ? 'reinforce-weak-topic'
        : courseHasProgress.has(course.id)
          ? 'continue-course'
          : 'start-course'

      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        courseId: course.id,
        courseTitle: course.title,
        href: `/courses/${course.slug}/${lesson.slug}`,
        reason,
        topicIds,
        weakTopicIds,
        score: weaknessScore * 10_000 + (courseHasProgress.has(course.id) ? 1_000 : 0) - position,
      }
    })
    .sort((left, right) => right.score - left.score || left.lessonId.localeCompare(right.lessonId))
    .slice(0, limit)
    .map((candidate) => ({
      lessonId: candidate.lessonId,
      lessonTitle: candidate.lessonTitle,
      courseId: candidate.courseId,
      courseTitle: candidate.courseTitle,
      href: candidate.href,
      reason: candidate.reason,
      topicIds: candidate.topicIds,
      weakTopicIds: candidate.weakTopicIds,
    }))
}
