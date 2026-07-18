import { describe, expect, it } from 'vitest'
import type { QuizQuestion } from '@/types/learning'
import type { QuizAnswer } from '@/services/quiz-engine'
import {
  QUIZ_SESSION_PASS_THRESHOLD_PERCENT,
  classifyPerformance,
  summarizeQuizSession,
} from '@/services/quiz-session-summary'

function question(
  id: string,
  overrides: Partial<QuizQuestion> = {},
): QuizQuestion {
  return {
    id,
    type: 'multiple-choice',
    prompt: `${id} prompt`,
    options: ['A', 'B', 'C'],
    correctAnswerIds: ['A'],
    explanation: `${id} explanation`,
    topicIds: ['core'],
    ...overrides,
  }
}

function answer(questionId: string, correct: boolean, topicIds: string[] = ['core']): QuizAnswer {
  return { questionId, selectedAnswerIds: [], correct, topicIds }
}

describe('classifyPerformance', () => {
  it('maps 90+ to excellent', () => {
    expect(classifyPerformance(90)).toBe('excellent')
    expect(classifyPerformance(100)).toBe('excellent')
  })

  it('maps 70-89 to passing', () => {
    expect(classifyPerformance(70)).toBe('passing')
    expect(classifyPerformance(QUIZ_SESSION_PASS_THRESHOLD_PERCENT)).toBe('passing')
    expect(classifyPerformance(89)).toBe('passing')
  })

  it('maps 50-69 to needs-work', () => {
    expect(classifyPerformance(50)).toBe('needs-work')
    expect(classifyPerformance(69)).toBe('needs-work')
  })

  it('maps <50 to failing', () => {
    expect(classifyPerformance(0)).toBe('failing')
    expect(classifyPerformance(49)).toBe('failing')
  })
})

describe('summarizeQuizSession', () => {
  it('returns safe empty state for an empty bank', () => {
    const summary = summarizeQuizSession([], [])
    expect(summary.totalQuestions).toBe(0)
    expect(summary.questionTypeStats).toEqual([])
    expect(summary.topicStats).toEqual([])
    expect(summary.performanceBand).toBe('failing')
    expect(summary.strongestTopic).toBeUndefined()
    expect(summary.weakestTopic).toBeUndefined()
  })

  it('computes overall accuracy from the answers', () => {
    const bank = [question('q1'), question('q2'), question('q3'), question('q4')]
    const answers = [
      answer('q1', true),
      answer('q2', true),
      answer('q3', false),
      answer('q4', false),
    ]

    const summary = summarizeQuizSession(bank, answers)
    expect(summary.totalQuestions).toBe(4)
    expect(summary.correctAnswers).toBe(2)
    expect(summary.accuracyPercent).toBe(50)
    expect(summary.performanceBand).toBe('needs-work')
  })

  it('groups accuracy by question type', () => {
    const bank = [
      question('q1', { type: 'multiple-choice' }),
      question('q2', { type: 'multiple-choice' }),
      question('q3', { type: 'true-false' }),
    ]
    const answers = [
      answer('q1', true),
      answer('q2', false),
      answer('q3', true),
    ]

    const summary = summarizeQuizSession(bank, answers)
    const mc = summary.questionTypeStats.find((stat) => stat.type === 'multiple-choice')
    const tf = summary.questionTypeStats.find((stat) => stat.type === 'true-false')
    expect(mc).toMatchObject({ type: 'multiple-choice', total: 2, correct: 1, accuracyPercent: 50 })
    expect(tf).toMatchObject({ type: 'true-false', total: 1, correct: 1, accuracyPercent: 100 })
  })

  it('breaks accuracy down by topic', () => {
    const bank = [
      question('q1', { topicIds: ['scba', 'core'] }),
      question('q2', { topicIds: ['scba'] }),
      question('q3', { topicIds: ['mayday'] }),
    ]
    const answers = [
      answer('q1', true, ['scba', 'core']),
      answer('q2', false, ['scba']),
      answer('q3', true, ['mayday']),
    ]

    const summary = summarizeQuizSession(bank, answers)
    const byId = new Map(summary.topicStats.map((stat) => [stat.topicId, stat]))
    expect(byId.get('scba')).toMatchObject({ total: 2, correct: 1, accuracyPercent: 50 })
    expect(byId.get('core')).toMatchObject({ total: 1, correct: 1, accuracyPercent: 100 })
    expect(byId.get('mayday')).toMatchObject({ total: 1, correct: 1, accuracyPercent: 100 })
  })

  it('picks strongest and weakest topics with distinct accuracy', () => {
    const bank = [
      question('q1', { topicIds: ['strong'] }),
      question('q2', { topicIds: ['strong'] }),
      question('q3', { topicIds: ['weak'] }),
      question('q4', { topicIds: ['weak'] }),
    ]
    const answers = [
      answer('q1', true),
      answer('q2', true),
      answer('q3', false),
      answer('q4', false),
    ]

    const summary = summarizeQuizSession(bank, answers)
    expect(summary.strongestTopic?.topicId).toBe('strong')
    expect(summary.strongestTopic?.accuracyPercent).toBe(100)
    expect(summary.weakestTopic?.topicId).toBe('weak')
    expect(summary.weakestTopic?.accuracyPercent).toBe(0)
  })

  it('does not report a weakest topic when only one topic exists', () => {
    const bank = [question('q1', { topicIds: ['only'] }), question('q2', { topicIds: ['only'] })]
    const answers = [answer('q1', true), answer('q2', false)]

    const summary = summarizeQuizSession(bank, answers)
    expect(summary.strongestTopic?.topicId).toBe('only')
    expect(summary.weakestTopic).toBeUndefined()
  })

  it('flags question types answered perfectly as mastered and zero-correct as struggling', () => {
    const bank = [
      question('q1', { type: 'true-false' }),
      question('q2', { type: 'true-false' }),
      question('q3', { type: 'multiple-choice' }),
      question('q4', { type: 'multiple-choice' }),
    ]
    const answers = [answer('q1', true), answer('q2', true), answer('q3', false), answer('q4', false)]

    const summary = summarizeQuizSession(bank, answers)
    expect(summary.masteredQuestionTypes).toEqual(['true-false'])
    expect(summary.strugglingQuestionTypes).toEqual(['multiple-choice'])
  })

  it('flags question types with zero correct as struggling', () => {
    const bank = [
      question('q1', { type: 'ordering' }),
      question('q2', { type: 'ordering' }),
      question('q3', { type: 'multiple-choice' }),
    ]
    const answers = [answer('q1', false), answer('q2', false), answer('q3', true)]

    const summary = summarizeQuizSession(bank, answers)
    expect(summary.strugglingQuestionTypes).toEqual(['ordering'])
    expect(summary.masteredQuestionTypes).toEqual(['multiple-choice'])
  })

  it('treats unanswered bank questions as incorrect', () => {
    const bank = [question('q1'), question('q2')]
    const answers = [answer('q1', true)]

    const summary = summarizeQuizSession(bank, answers)
    expect(summary.correctAnswers).toBe(1)
    expect(summary.accuracyPercent).toBe(50)
  })

  it('ignores answers that have no matching question in the bank', () => {
    const bank = [question('q1')]
    const answers = [answer('q1', true), answer('q-ghost', true)]

    const summary = summarizeQuizSession(bank, answers)
    expect(summary.totalQuestions).toBe(1)
    expect(summary.correctAnswers).toBe(1)
  })

  it('reports excellent band for a perfect score', () => {
    const bank = [question('q1'), question('q2'), question('q3'), question('q4'), question('q5')]
    const answers = bank.map((q) => answer(q.id, true))

    const summary = summarizeQuizSession(bank, answers)
    expect(summary.accuracyPercent).toBe(100)
    expect(summary.performanceBand).toBe('excellent')
  })
})
