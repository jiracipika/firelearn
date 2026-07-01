import type { QuizQuestion } from '@/types/learning'

export type QuizMode = 'practice' | 'exam'

export type QuizAnswer = {
  questionId: string
  selectedAnswerIds: string[]
  correct: boolean
  topicIds: string[]
}

export type QuizResult = {
  totalQuestions: number
  correctAnswers: number
  scorePercent: number
  passed: boolean
  weakTopicIds: string[]
  answers: QuizAnswer[]
}

function normalizeAnswers(values: string[]) {
  return [...values].sort((a, b) => a.localeCompare(b))
}

export function isAnswerCorrect(question: QuizQuestion, selectedAnswerIds: string[]) {
  const expected = normalizeAnswers(question.correctAnswerIds)
  const actual = normalizeAnswers(selectedAnswerIds)
  return expected.length === actual.length && expected.every((value, index) => value === actual[index])
}

export function buildQuizResult(questions: QuizQuestion[], answers: QuizAnswer[]): QuizResult {
  const correctAnswers = answers.filter((answer) => answer.correct).length
  const scorePercent = questions.length === 0 ? 0 : Math.round((correctAnswers / questions.length) * 100)
  const missedTopicCounts = new Map<string, number>()

  answers.filter((answer) => !answer.correct).forEach((answer) => {
    answer.topicIds.forEach((topicId) => missedTopicCounts.set(topicId, (missedTopicCounts.get(topicId) ?? 0) + 1))
  })

  const weakTopicIds = [...missedTopicCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([topicId]) => topicId)

  return {
    totalQuestions: questions.length,
    correctAnswers,
    scorePercent,
    passed: scorePercent >= 70,
    weakTopicIds,
    answers,
  }
}

export function collectQuestionBank(questions: QuizQuestion[], mode: QuizMode) {
  if (mode === 'practice') return questions
  // Exam mode: shuffle options using a deterministic per-question seed
  // so SSR and client render match (avoids hydration mismatch).
  return questions.map((question, questionIndex) => {
    const seedBase = hashCode(`${question.id}-${questionIndex}`)
    return {
      ...question,
      options: seededShuffle(question.options, seedBase),
    }
  })
}

/** Stable string hash (djb2) — deterministic across SSR and client. */
function hashCode(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/** Deterministic Fisher-Yates shuffle using a seed value. */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array]
  let state = seed || 1
  for (let i = result.length - 1; i > 0; i--) {
    state = (state * 9301 + 49297) % 233280
    const j = Math.floor((state / 233280) * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function supportsMultipleSelection(question: QuizQuestion) {
  return question.type === 'multiple-answer'
}

export type ExamConfig = {
  questionCount: number
  timeLimitMinutes: number
  passingScorePercent: number
}

export const DEFAULT_EXAM_CONFIG: ExamConfig = {
  questionCount: 25,
  timeLimitMinutes: 30,
  passingScorePercent: 80,
}

/**
 * Builds a mixed-topic exam from all quiz questions across the academy.
 * In exam mode, questions are shuffled, options are shuffled,
 * and a time limit applies.
 *
 * If `weakTopicIds` is provided, questions touching those topics are
 * prioritized in the selection so the exam targets the learner's gaps.
 */
export function buildExamQuestionBank(
  allQuestions: QuizQuestion[],
  config: ExamConfig = DEFAULT_EXAM_CONFIG,
  options?: { weakTopicIds?: string[]; seed?: number },
) {
  const weakSet = new Set(options?.weakTopicIds ?? [])
  const seed = options?.seed ?? Date.now()
  const target = Math.min(config.questionCount, allQuestions.length)

  // Partition into weak-topic and remaining, shuffle each deterministically
  const weakPool = allQuestions.filter((q) => q.topicIds.some((t) => weakSet.has(t)))
  const restPool = allQuestions.filter((q) => !q.topicIds.some((t) => weakSet.has(t)))
  const shuffledWeak = seededShuffleQuestions(weakPool, seed)
  const shuffledRest = seededShuffleQuestions(restPool, seed + 1)

  // Take weak-topic questions first, fill from the rest
  const selected = [...shuffledWeak, ...shuffledRest].slice(0, target)

  return selected.map((question, i) => ({
    ...question,
    options: seededShuffle(question.options, hashCode(`${question.id}-opt-${seed}-${i}`)),
    timeLimitSeconds: config.timeLimitMinutes * 60,
  }))
}

function seededShuffleQuestions(questions: QuizQuestion[], seed: number): QuizQuestion[] {
  return seededShuffle(questions, seed)
}
