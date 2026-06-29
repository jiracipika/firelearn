export type Difficulty = 'Recruit' | 'Firefighter I' | 'Firefighter II' | 'Company Officer' | 'Advanced'

export type LessonContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'callout'; title: string; text: string }
  | { type: 'list'; title: string; items: string[] }

export type QuizQuestionType =
  | 'multiple-choice'
  | 'multiple-answer'
  | 'true-false'
  | 'ordering'
  | 'image'
  | 'scenario'
  | 'case-study'

export type QuizQuestion = {
  id: string
  type: QuizQuestionType
  prompt: string
  options: string[]
  correctAnswerIds: string[]
  explanation: string
  topicIds: string[]
  timeLimitSeconds?: number
}

export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy'

export type Flashcard = {
  id: string
  front: string
  back: string
  topicIds: string[]
  difficulty: Difficulty
  easeFactor: number
  intervalDays: number
  nextReview: string
  reviewCount: number
  lastReviewed?: string
}

export type Lesson = {
  id: string
  slug: string
  title: string
  difficulty: Difficulty
  estimatedMinutes: number
  objectives: string[]
  prerequisites: string[]
  content: LessonContentBlock[]
  imageAlt: string
  videoPlaceholder: string
  knowledgeCheck: QuizQuestion
  summary: string[]
  quiz: QuizQuestion[]
  flashcards: Flashcard[]
  references: string[]
  completion: { completed: boolean; percent: number }
}

export type Module = {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

export type Course = {
  id: string
  slug: string
  title: string
  description: string
  categoryId: string
  difficulty: Difficulty
  estimatedMinutes: number
  progressPercent: number
  xp: number
  modules: Module[]
}

export type Category = {
  id: string
  slug: string
  title: string
  description: string
  icon: string
}

export type LearnerProgress = {
  streakDays: number
  xp: number
  level: number
  dailyGoalMinutes: number
  minutesStudiedToday: number
  weeklyActivity: number[]
  achievements: string[]
}
