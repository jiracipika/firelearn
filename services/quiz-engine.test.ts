import { describe, expect, it } from 'vitest'
import type { QuizQuestion } from '@/types/learning'
import { buildQuizResult, isAnswerCorrect, supportsMultipleSelection } from '@/services/quiz-engine'

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
