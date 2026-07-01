import { describe, expect, it } from 'vitest'
import type { QuizQuestion } from '@/types/learning'
import { buildExamQuestionBank, buildQuizResult, isAnswerCorrect, supportsMultipleSelection, DEFAULT_EXAM_CONFIG } from '@/services/quiz-engine'

const multipleAnswerQuestion: QuizQuestion = {
  id: 'q1',
  type: 'multiple-answer',
  prompt: 'Which items are part of an air-management decision?',
  options: ['Lowest air', 'Exit distance', 'Helmet color'],
  correctAnswerIds: ['Lowest air', 'Exit distance'],
  explanation: 'Air management considers pressure and exit complexity.',
  topicIds: ['scba'],
}

describe('quiz engine', () => {
  it('scores multiple-answer questions independent of selection order', () => {
    expect(isAnswerCorrect(multipleAnswerQuestion, ['Exit distance', 'Lowest air'])).toBe(true)
  })

  it('rejects incomplete multiple-answer selections', () => {
    expect(isAnswerCorrect(multipleAnswerQuestion, ['Lowest air'])).toBe(false)
  })

  it('detects weak topics from missed answers', () => {
    const result = buildQuizResult([multipleAnswerQuestion], [{ questionId: 'q1', selectedAnswerIds: ['Helmet color'], correct: false, topicIds: ['scba'] }])

    expect(result.scorePercent).toBe(0)
    expect(result.passed).toBe(false)
    expect(result.weakTopicIds).toEqual(['scba'])
  })

  it('identifies multiple-answer question types', () => {
    expect(supportsMultipleSelection(multipleAnswerQuestion)).toBe(true)
  })
})

describe('exam mode', () => {
  const bank: QuizQuestion[] = Array.from({ length: 50 }, (_, i) => ({
    id: `q-${i}`,
    type: 'multiple-choice' as const,
    prompt: `Question ${i} prompt here`,
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIds: ['A'],
    explanation: `Explanation for question ${i} here`,
    topicIds: ['test'],
  }))

  it('builds a shuffled exam question bank with a target count', () => {
    const exam = buildExamQuestionBank(bank, { questionCount: 10, timeLimitMinutes: 15, passingScorePercent: 80 })
    expect(exam).toHaveLength(10)
    expect(exam.every((question) => question.timeLimitSeconds === 900)).toBe(true)
  })

  it('caps exam questions at available bank size', () => {
    const smallBank: QuizQuestion[] = Array.from({ length: 5 }, (_, i) => ({
      id: `q-${i}`,
      type: 'multiple-choice' as const,
      prompt: `Question ${i} prompt here`,
      options: ['A', 'B'],
      correctAnswerIds: ['A'],
      explanation: `Explanation for question ${i} here`,
      topicIds: ['test'],
    }))
    const exam = buildExamQuestionBank(smallBank, { questionCount: 25, timeLimitMinutes: 30, passingScorePercent: 80 })
    expect(exam).toHaveLength(5)
  })

  it('uses default config values when no config provided', () => {
    const exam = buildExamQuestionBank(bank)
    expect(exam).toHaveLength(DEFAULT_EXAM_CONFIG.questionCount)
    expect(exam.every((question) => question.timeLimitSeconds === DEFAULT_EXAM_CONFIG.timeLimitMinutes * 60)).toBe(true)
  })

  it('prioritizes weak-topic questions when weakTopicIds provided', () => {
    const mixedBank: QuizQuestion[] = Array.from({ length: 50 }, (_, i) => ({
      id: `q-${i}`,
      type: 'multiple-choice' as const,
      prompt: `Question ${i} prompt here`,
      options: ['A', 'B', 'C', 'D'],
      correctAnswerIds: ['A'],
      explanation: `Explanation for question ${i} here`,
      topicIds: i < 10 ? ['weak-topic'] : ['other-topic'],
    }))

    const exam = buildExamQuestionBank(
      mixedBank,
      { questionCount: 15, timeLimitMinutes: 30, passingScorePercent: 80 },
      { weakTopicIds: ['weak-topic'], seed: 42 },
    )

    expect(exam).toHaveLength(15)
    // All 10 weak-topic questions should be in the exam (prioritized)
    const weakCount = exam.filter((q) => q.topicIds.includes('weak-topic')).length
    expect(weakCount).toBe(10)
  })

  it('produces deterministic output for the same seed', () => {
    const exam1 = buildExamQuestionBank(bank, { questionCount: 10, timeLimitMinutes: 30, passingScorePercent: 80 }, { seed: 999 })
    const exam2 = buildExamQuestionBank(bank, { questionCount: 10, timeLimitMinutes: 30, passingScorePercent: 80 }, { seed: 999 })

    expect(exam1.map((q) => q.id)).toEqual(exam2.map((q) => q.id))
    expect(exam1.map((q) => q.options)).toEqual(exam2.map((q) => q.options))
  })
})
