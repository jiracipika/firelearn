import type { Course, Difficulty } from '@/types/learning'

export type LearningPathStep = {
  courseId: string
  courseSlug: string
  title: string
  categoryId: string
  difficulty: Difficulty
  estimatedMinutes: number
  lessonCount: number
  completed: boolean
}

export type LearningPath = {
  categoryId: string
  totalCourses: number
  completedCourses: number
  totalEstimatedMinutes: number
  nextStep?: LearningPathStep
  steps: LearningPathStep[]
}

const difficultyRank: Record<Difficulty, number> = {
  Recruit: 1,
  'Firefighter I': 2,
  'Firefighter II': 3,
  'Company Officer': 4,
  Advanced: 5,
}

function lessonCount(course: Course): number {
  return course.modules.reduce((total, module) => total + module.lessons.length, 0)
}

function toStep(course: Course, completedCourseIds: Set<string>): LearningPathStep {
  return {
    courseId: course.id,
    courseSlug: course.slug,
    title: course.title,
    categoryId: course.categoryId,
    difficulty: course.difficulty,
    estimatedMinutes: course.estimatedMinutes,
    lessonCount: lessonCount(course),
    completed: completedCourseIds.has(course.id),
  }
}

export function buildLearningPaths(courses: Course[], completedCourseIds: string[] = []): LearningPath[] {
  const completed = new Set(completedCourseIds)
  const grouped = new Map<string, Course[]>()

  for (const course of courses) {
    const list = grouped.get(course.categoryId) ?? []
    list.push(course)
    grouped.set(course.categoryId, list)
  }

  return Array.from(grouped.entries())
    .map(([categoryId, categoryCourses]) => {
      const steps = categoryCourses
        .slice()
        .sort((a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty] || a.title.localeCompare(b.title))
        .map((course) => toStep(course, completed))

      return {
        categoryId,
        totalCourses: steps.length,
        completedCourses: steps.filter((step) => step.completed).length,
        totalEstimatedMinutes: steps.reduce((total, step) => total + step.estimatedMinutes, 0),
        nextStep: steps.find((step) => !step.completed),
        steps,
      }
    })
    .sort((a, b) => a.categoryId.localeCompare(b.categoryId))
}

export function chooseLearningPath(courses: Course[], preferredCategoryId?: string, completedCourseIds: string[] = []): LearningPath | undefined {
  const paths = buildLearningPaths(courses, completedCourseIds)
  if (preferredCategoryId) {
    const preferred = paths.find((path) => path.categoryId === preferredCategoryId && path.nextStep)
    if (preferred) return preferred
  }
  return paths.find((path) => path.nextStep) ?? paths[0]
}
