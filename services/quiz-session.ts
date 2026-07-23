import type { QuizQuestion } from '@/types/learning'
import { isAnswerCorrect, type QuizAnswer, type QuizMode } from '@/services/quiz-engine'
import type { StorageLike } from '@/services/local-persistence'

const quizSessionsKey = 'firelearn.quizSessions.v1'
const maxSessionAgeMs = 7 * 24 * 60 * 60 * 1000

type StoredQuizSessions = Record<string, unknown>

export type QuizSessionSnapshot = {
  quizId: string
  mode: QuizMode
  activeQuestionIds: string[]
  index: number
  selectedAnswerIds: string[]
  answers: QuizAnswer[]
  submitted: boolean
  timerElapsed: number
  updatedAt: string
}

function readSessions(storage: StorageLike): StoredQuizSessions {
  try {
    const raw = storage.getItem(quizSessionsKey)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as StoredQuizSessions
      : {}
  } catch {
    return {}
  }
}

function sessionKey(quizId: string) {
  return encodeURIComponent(quizId)
}

export function saveQuizSession(storage: StorageLike, snapshot: QuizSessionSnapshot) {
  const sessions = readSessions(storage)
  sessions[sessionKey(snapshot.quizId)] = snapshot
  try {
    storage.setItem(quizSessionsKey, JSON.stringify(sessions))
    return true
  } catch {
    return false
  }
}

export function clearQuizSession(storage: StorageLike, quizId: string) {
  const sessions = readSessions(storage)
  delete sessions[sessionKey(quizId)]

  try {
    if (Object.keys(sessions).length === 0) {
      storage.removeItem(quizSessionsKey)
      return true
    }

    storage.setItem(quizSessionsKey, JSON.stringify(sessions))
    return true
  } catch {
    return false
  }
}

export function loadQuizSession(
  storage: StorageLike,
  quizId: string,
  questions: QuizQuestion[],
  now = new Date(),
): QuizSessionSnapshot | null {
  const candidate = readSessions(storage)[sessionKey(quizId)]
  if (!isValidSnapshot(candidate, quizId, questions, now)) {
    if (candidate !== undefined) clearQuizSession(storage, quizId)
    return null
  }
  return candidate
}

function sameStrings(actual: string[], expected: string[]) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index])
}

function isValidSnapshot(
  value: unknown,
  quizId: string,
  questions: QuizQuestion[],
  now: Date,
): value is QuizSessionSnapshot {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const snapshot = value as Partial<QuizSessionSnapshot>

  if (snapshot.quizId !== quizId) return false
  if (snapshot.mode !== 'practice' && snapshot.mode !== 'exam') return false
  if (!Array.isArray(snapshot.activeQuestionIds) || snapshot.activeQuestionIds.length === 0) return false
  if (!snapshot.activeQuestionIds.every((id): id is string => typeof id === 'string')) return false
  if (new Set(snapshot.activeQuestionIds).size !== snapshot.activeQuestionIds.length) return false

  const questionById = new Map(questions.map((question) => [question.id, question]))
  if (!snapshot.activeQuestionIds.every((id) => questionById.has(id))) return false

  if (!Number.isInteger(snapshot.index) || snapshot.index! < 0 || snapshot.index! >= snapshot.activeQuestionIds.length) return false
  if (typeof snapshot.submitted !== 'boolean') return false
  if (!Number.isFinite(snapshot.timerElapsed) || snapshot.timerElapsed! < 0) return false
  if (!Array.isArray(snapshot.selectedAnswerIds) || !snapshot.selectedAnswerIds.every((id) => typeof id === 'string')) return false
  if (new Set(snapshot.selectedAnswerIds).size !== snapshot.selectedAnswerIds.length) return false
  if (!Array.isArray(snapshot.answers)) return false

  const expectedAnswerCount = snapshot.submitted ? snapshot.index! + 1 : snapshot.index
  if (snapshot.answers.length !== expectedAnswerCount) return false

  for (let answerIndex = 0; answerIndex < snapshot.answers.length; answerIndex += 1) {
    const answer = snapshot.answers[answerIndex] as Partial<QuizAnswer> | undefined
    const expectedQuestionId = snapshot.activeQuestionIds[answerIndex]
    const expectedQuestion = questionById.get(expectedQuestionId)
    if (!answer || !expectedQuestion || answer.questionId !== expectedQuestionId) return false
    if (typeof answer.correct !== 'boolean') return false
    if (!Array.isArray(answer.selectedAnswerIds) || !answer.selectedAnswerIds.every((id) => expectedQuestion.options.includes(id))) return false
    if (new Set(answer.selectedAnswerIds).size !== answer.selectedAnswerIds.length) return false
    if (answer.correct !== isAnswerCorrect(expectedQuestion, answer.selectedAnswerIds)) return false
    if (!Array.isArray(answer.topicIds) || !answer.topicIds.every((id) => typeof id === 'string')) return false
    if (!sameStrings(answer.topicIds, expectedQuestion.topicIds)) return false
  }

  const currentQuestion = questionById.get(snapshot.activeQuestionIds[snapshot.index!])
  if (!currentQuestion || !snapshot.selectedAnswerIds.every((id) => currentQuestion.options.includes(id))) return false
  if (snapshot.submitted) {
    const currentAnswer = snapshot.answers[snapshot.answers.length - 1]
    if (!currentAnswer || !sameStrings(snapshot.selectedAnswerIds, currentAnswer.selectedAnswerIds)) return false
  }

  const updatedAt = typeof snapshot.updatedAt === 'string' ? Date.parse(snapshot.updatedAt) : Number.NaN
  const nowMs = now.getTime()
  if (!Number.isFinite(updatedAt) || updatedAt > nowMs + 5 * 60 * 1000 || nowMs - updatedAt > maxSessionAgeMs) return false

  return true
}
