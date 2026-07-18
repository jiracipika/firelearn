import type { QuizQuestion } from '@/types/learning'
import type { QuizAnswer } from '@/services/quiz-engine'

export const QUIZ_SESSION_PASS_THRESHOLD_PERCENT = 70

export type QuizPerformanceBand = 'excellent' | 'passing' | 'needs-work' | 'failing'

export type QuestionTypeStat = {
  type: QuizQuestion['type']
  total: number
  correct: number
  accuracyPercent: number
}

export type TopicStat = {
  topicId: string
  total: number
  correct: number
  accuracyPercent: number
}

export type QuizSessionSummary = {
  totalQuestions: number
  correctAnswers: number
  accuracyPercent: number
  performanceBand: QuizPerformanceBand
  questionTypeStats: QuestionTypeStat[]
  topicStats: TopicStat[]
  strongestTopic?: TopicStat
  weakestTopic?: TopicStat
  /** Question types the learner got fully correct (no misses). */
  masteredQuestionTypes: QuizQuestion['type'][]
  /** Question types where the learner missed every attempt. */
  strugglingQuestionTypes: QuizQuestion['type'][]
}

const emptySummary: QuizSessionSummary = {
  totalQuestions: 0,
  correctAnswers: 0,
  accuracyPercent: 0,
  performanceBand: 'failing',
  questionTypeStats: [],
  topicStats: [],
  masteredQuestionTypes: [],
  strugglingQuestionTypes: [],
}

function percentRound(numerator: number, denominator: number): number {
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 100)
}

/**
 * Map an accuracy score to a four-band performance label.
 *
 * - excellent   : >= 90% — exam-ready
 * - passing     : 70-89% — meets the 70% pass threshold
 * - needs-work  : 50-69% — below pass, worth a targeted retry
 * - failing     : < 50% — review material before reattempting
 */
export function classifyPerformance(accuracyPercent: number): QuizPerformanceBand {
  if (accuracyPercent >= 90) return 'excellent'
  if (accuracyPercent >= QUIZ_SESSION_PASS_THRESHOLD_PERCENT) return 'passing'
  if (accuracyPercent >= 50) return 'needs-work'
  return 'failing'
}

function buildQuestionTypeStats(
  questions: QuizQuestion[],
  answerByQuestion: Map<string, QuizAnswer | undefined>,
): QuestionTypeStat[] {
  const byType = new Map<QuizQuestion['type'], { total: number; correct: number }>()

  for (const question of questions) {
    const entry = byType.get(question.type) ?? { total: 0, correct: 0 }
    entry.total += 1
    if (answerByQuestion.get(question.id)?.correct) entry.correct += 1
    byType.set(question.type, entry)
  }

  return [...byType.entries()]
    .map(([type, value]) => ({
      type,
      total: value.total,
      correct: value.correct,
      accuracyPercent: percentRound(value.correct, value.total),
    }))
    .sort((a, b) => a.type.localeCompare(b.type))
}

function buildTopicStats(
  questions: QuizQuestion[],
  answerByQuestion: Map<string, QuizAnswer | undefined>,
): TopicStat[] {
  const byTopic = new Map<string, { total: number; correct: number }>()

  for (const question of questions) {
    const correct = answerByQuestion.get(question.id)?.correct ?? false
    for (const topicId of question.topicIds) {
      const entry = byTopic.get(topicId) ?? { total: 0, correct: 0 }
      entry.total += 1
      if (correct) entry.correct += 1
      byTopic.set(topicId, entry)
    }
  }

  const stats: TopicStat[] = [...byTopic.entries()]
    .map(([topicId, value]) => ({
      topicId,
      total: value.total,
      correct: value.correct,
      accuracyPercent: percentRound(value.correct, value.total),
    }))

  // Stable ordering: highest accuracy first, then by topic id.
  stats.sort((a, b) => b.accuracyPercent - a.accuracyPercent || a.topicId.localeCompare(b.topicId))
  return stats
}

function pickExtremes(topicStats: TopicStat[]): { strongestTopic?: TopicStat; weakestTopic?: TopicStat } {
  if (topicStats.length === 0) return {}
  if (topicStats.length === 1) {
    const only = topicStats[0]!
    // A single topic is its own strongest; no contrast to call anything weakest.
    return { strongestTopic: only }
  }
  // topicStats is sorted highest-accuracy first; pick the ends while skipping
  // ties so "strongest" and "weakest" never point at the same accuracy band.
  const strongestTopic = topicStats[0]!
  const reversed = [...topicStats].sort((a, b) => a.accuracyPercent - b.accuracyPercent || a.topicId.localeCompare(b.topicId))
  const weakestTopic = reversed[0]!
  if (strongestTopic.topicId === weakestTopic.topicId) return { strongestTopic }
  return { strongestTopic, weakestTopic }
}

/**
 * Summarize a completed quiz session by question type and topic.
 *
 * The summary is independent of `QuizResult` so it can be reused by the
 * dashboard, profile, or analytics views later. It reads correctness from
 * the `QuizAnswer` records (already normalized by the quiz engine) and the
 * topic / type metadata from the source questions.
 *
 * Answers without a matching question are ignored. Questions without a
 * matching answer count as incorrect at the overall level only if they were
 * part of the bank the learner was actually shown — callers should pass the
 * exact bank used during the attempt, which is what `buildQuizResult` expects
 * today.
 */
export function summarizeQuizSession(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
): QuizSessionSummary {
  if (questions.length === 0) return { ...emptySummary }

  const answerByQuestion = new Map<string, QuizAnswer | undefined>()
  for (const answer of answers) answerByQuestion.set(answer.questionId, answer)

  let correctAnswers = 0
  for (const question of questions) {
    if (answerByQuestion.get(question.id)?.correct) correctAnswers += 1
  }

  const totalQuestions = questions.length
  const accuracyPercent = percentRound(correctAnswers, totalQuestions)
  const performanceBand = classifyPerformance(accuracyPercent)

  const questionTypeStats = buildQuestionTypeStats(questions, answerByQuestion)
  const topicStats = buildTopicStats(questions, answerByQuestion)
  const { strongestTopic, weakestTopic } = pickExtremes(topicStats)

  const masteredQuestionTypes = questionTypeStats
    .filter((stat) => stat.total > 0 && stat.correct === stat.total)
    .map((stat) => stat.type)
    .sort()
  const strugglingQuestionTypes = questionTypeStats
    .filter((stat) => stat.total > 0 && stat.correct === 0)
    .map((stat) => stat.type)
    .sort()

  return {
    totalQuestions,
    correctAnswers,
    accuracyPercent,
    performanceBand,
    questionTypeStats,
    topicStats,
    strongestTopic,
    weakestTopic,
    masteredQuestionTypes,
    strugglingQuestionTypes,
  }
}
