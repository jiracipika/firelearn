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
  return questions.map((question, questionIndex) => ({
    ...question,
    options: [...question.options].sort((a, b) => `${questionIndex}-${a}`.localeCompare(`${questionIndex}-${b}`)),
  }))
}

export function supportsMultipleSelection(question: QuizQuestion) {
  return question.type === 'multiple-answer'
}
