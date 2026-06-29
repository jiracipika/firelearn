import { z } from 'zod'
import type { Course } from '@/types/learning'

const difficultySchema = z.enum(['Recruit', 'Firefighter I', 'Firefighter II', 'Company Officer', 'Advanced'])

const questionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['multiple-choice', 'multiple-answer', 'true-false', 'ordering', 'image', 'scenario', 'case-study']),
  prompt: z.string().min(12),
  options: z.array(z.string().min(1)).min(2),
  correctAnswerIds: z.array(z.string().min(1)).min(1),
  explanation: z.string().min(20),
  topicIds: z.array(z.string().min(1)).min(1),
  timeLimitSeconds: z.number().positive().optional(),
}).superRefine((question, context) => {
  question.correctAnswerIds.forEach((answer) => {
    if (!question.options.includes(answer)) {
      context.addIssue({ code: 'custom', message: `Correct answer "${answer}" is not present in options`, path: ['correctAnswerIds'] })
    }
  })
})

const flashcardSchema = z.object({
  id: z.string().min(1),
  front: z.string().min(8),
  back: z.string().min(8),
  topicIds: z.array(z.string().min(1)).min(1),
  difficulty: difficultySchema,
  easeFactor: z.number().min(1.3),
  intervalDays: z.number().min(0),
  nextReview: z.string().datetime(),
  reviewCount: z.number().min(0),
  lastReviewed: z.string().datetime().optional(),
})

const contentBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text: z.string().min(30) }),
  z.object({ type: z.literal('callout'), title: z.string().min(3), text: z.string().min(20) }),
  z.object({ type: z.literal('list'), title: z.string().min(3), items: z.array(z.string().min(3)).min(2) }),
])

const lessonSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(3),
  difficulty: difficultySchema,
  estimatedMinutes: z.number().positive(),
  objectives: z.array(z.string().min(8)).min(1),
  prerequisites: z.array(z.string().min(3)),
  content: z.array(contentBlockSchema).min(1),
  imageAlt: z.string().min(8),
  videoPlaceholder: z.string().min(8),
  knowledgeCheck: questionSchema,
  summary: z.array(z.string().min(8)).min(1),
  quiz: z.array(questionSchema).min(1),
  flashcards: z.array(flashcardSchema).min(1),
  references: z.array(z.string().min(3)).min(1),
  completion: z.object({ completed: z.boolean(), percent: z.number().min(0).max(100) }),
})

const courseSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(20),
  categoryId: z.string().min(1),
  difficulty: difficultySchema,
  estimatedMinutes: z.number().positive(),
  progressPercent: z.number().min(0).max(100),
  xp: z.number().min(0),
  modules: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(3),
    description: z.string().min(10),
    lessons: z.array(lessonSchema).min(1),
  })).min(1),
})

export function validateCourses(courses: Course[]): Course[] {
  return z.array(courseSchema).parse(courses) as Course[]
}
