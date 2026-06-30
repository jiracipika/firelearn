import type { Course } from '@/types/learning'
import type { QuizAttempt } from '@/services/local-persistence'

export type NextActionInput = {
  courses: Course[]
  completedLessonIds: string[]
  quizHistory: QuizAttempt[]
  weakTopicIds: string[]
  dueFlashcardCount: number
}

export type NextAction = {
  kind: 'lesson' | 'quiz' | 'flashcards' | 'browse'
  title: string
  description: string
  href: string
  priority: number
}

function firstUncompletedLesson(courses: Course[], completedLessonIds: string[]): NextAction | undefined {
  const completed = new Set(completedLessonIds)

  for (const course of courses) {
    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        if (!completed.has(lesson.id)) {
          return {
            kind: 'lesson',
            title: lesson.title,
            description: `Continue ${course.title} · ${lesson.estimatedMinutes} min · ${lesson.difficulty}`,
            href: `/courses/${course.slug}/${lesson.slug}`,
            priority: completed.size === 0 ? 90 : 72,
          }
        }
      }
    }
  }
}

function weakestQuizAction(courses: Course[], weakTopicIds: string[]): NextAction | undefined {
  if (weakTopicIds.length === 0) return undefined
  const weakTopics = new Set(weakTopicIds)

  for (const course of courses) {
    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        if (lesson.quiz.some((question) => question.topicIds.some((topicId) => weakTopics.has(topicId)))) {
          return {
            kind: 'quiz',
            title: `Retest weak topic: ${weakTopicIds[0]}`,
            description: `Practice targeted questions from ${lesson.title}.`,
            href: `/quiz?course=${encodeURIComponent(course.slug)}&lesson=${encodeURIComponent(lesson.slug)}`,
            priority: 96,
          }
        }
      }
    }
  }
}

function flashcardAction(dueFlashcardCount: number): NextAction | undefined {
  if (dueFlashcardCount <= 0) return undefined
  return {
    kind: 'flashcards',
    title: `Clear ${dueFlashcardCount} due flashcard${dueFlashcardCount === 1 ? '' : 's'}`,
    description: 'Protect recall before starting new material.',
    href: '/flashcards',
    priority: dueFlashcardCount >= 10 ? 94 : 82,
  }
}

function quizFollowupAction(quizHistory: QuizAttempt[]): NextAction | undefined {
  const latest = quizHistory.at(-1)
  if (!latest || latest.scorePercent >= 80) return undefined

  return {
    kind: 'quiz',
    title: 'Repeat the last missed quiz set',
    description: `Latest score was ${latest.scorePercent}%. Review explanations and retake immediately.`,
    href: '/quiz',
    priority: 88,
  }
}

export function chooseNextAction(input: NextActionInput): NextAction {
  const actions = [
    weakestQuizAction(input.courses, input.weakTopicIds),
    flashcardAction(input.dueFlashcardCount),
    quizFollowupAction(input.quizHistory),
    firstUncompletedLesson(input.courses, input.completedLessonIds),
    {
      kind: 'browse',
      title: 'Browse the academy',
      description: 'Pick a new discipline and start a short rep.',
      href: '/courses',
      priority: 10,
    } satisfies NextAction,
  ].filter((action): action is NextAction => Boolean(action))

  return actions.sort((a, b) => b.priority - a.priority)[0]
}
