import { describe, expect, it } from 'vitest'
import type { QuizQuestion } from '@/types/learning'
import { createMemoryStorage } from '@/services/local-persistence'
import {
  clearQuizSession,
  loadQuizSession,
  saveQuizSession,
  type QuizSessionSnapshot,
} from '@/services/quiz-session'

const questions: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    prompt: 'First?',
    options: ['A', 'B'],
    correctAnswerIds: ['A'],
    explanation: 'A is correct.',
    topicIds: ['fire-behavior'],
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    prompt: 'Second?',
    options: ['C', 'D'],
    correctAnswerIds: ['D'],
    explanation: 'D is correct.',
    topicIds: ['size-up'],
  },
]

const snapshot: QuizSessionSnapshot = {
  quizId: 'Fireground quiz',
  mode: 'practice',
  activeQuestionIds: ['q1', 'q2'],
  index: 1,
  selectedAnswerIds: ['D'],
  answers: [{
    questionId: 'q1',
    selectedAnswerIds: ['A'],
    correct: true,
    topicIds: ['fire-behavior'],
  }],
  submitted: false,
  timerElapsed: 9,
  updatedAt: '2026-07-22T01:00:00.000Z',
}

describe('quiz session persistence', () => {
  it('round-trips a valid in-progress session', () => {
    const storage = createMemoryStorage()
    saveQuizSession(storage, snapshot)

    expect(loadQuizSession(storage, 'Fireground quiz', questions, new Date('2026-07-22T02:00:00.000Z'))).toEqual(snapshot)
  })

  it('keeps independent sessions for different quiz scopes', () => {
    const storage = createMemoryStorage()
    saveQuizSession(storage, snapshot)
    saveQuizSession(storage, { ...snapshot, quizId: 'Course quiz', index: 0, answers: [], selectedAnswerIds: [] })

    expect(loadQuizSession(storage, 'Fireground quiz', questions, new Date('2026-07-22T02:00:00.000Z'))?.index).toBe(1)
    expect(loadQuizSession(storage, 'Course quiz', questions, new Date('2026-07-22T02:00:00.000Z'))?.index).toBe(0)
  })

  it('rejects stale, corrupt, or catalog-incompatible sessions', () => {
    const staleStorage = createMemoryStorage()
    saveQuizSession(staleStorage, snapshot)
    expect(loadQuizSession(staleStorage, snapshot.quizId, questions, new Date('2026-07-30T02:00:00.000Z'))).toBeNull()

    const corruptStorage = createMemoryStorage()
    corruptStorage.setItem('firelearn.quizSessions.v1', '{broken')
    expect(loadQuizSession(corruptStorage, snapshot.quizId, questions)).toBeNull()

    const changedCatalogStorage = createMemoryStorage()
    saveQuizSession(changedCatalogStorage, snapshot)
    expect(loadQuizSession(changedCatalogStorage, snapshot.quizId, questions.slice(0, 1))).toBeNull()
    expect(changedCatalogStorage.getItem('firelearn.quizSessions.v1')).toBeNull()
  })

  it('rejects impossible progress and invalid selected options', () => {
    const storage = createMemoryStorage()
    saveQuizSession(storage, { ...snapshot, index: 0, answers: snapshot.answers })
    expect(loadQuizSession(storage, snapshot.quizId, questions)).toBeNull()

    saveQuizSession(storage, { ...snapshot, selectedAnswerIds: ['not-an-option'] })
    expect(loadQuizSession(storage, snapshot.quizId, questions)).toBeNull()

    saveQuizSession(storage, {
      ...snapshot,
      answers: [{ ...snapshot.answers[0], correct: false }],
    })
    expect(loadQuizSession(storage, snapshot.quizId, questions)).toBeNull()

    saveQuizSession(storage, {
      ...snapshot,
      answers: [{ ...snapshot.answers[0], topicIds: ['tampered-topic'] }],
    })
    expect(loadQuizSession(storage, snapshot.quizId, questions)).toBeNull()
  })

  it('clears only the requested quiz session', () => {
    const storage = createMemoryStorage()
    saveQuizSession(storage, snapshot)
    saveQuizSession(storage, { ...snapshot, quizId: 'Course quiz' })

    clearQuizSession(storage, snapshot.quizId)

    const withinSessionLifetime = new Date('2026-07-22T02:00:00.000Z')
    expect(loadQuizSession(storage, snapshot.quizId, questions, withinSessionLifetime)).toBeNull()
    expect(loadQuizSession(storage, 'Course quiz', questions, withinSessionLifetime)).not.toBeNull()
  })

  it('does not crash the quiz when browser storage is unavailable', () => {
    const unavailableStorage = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('quota exceeded') },
      removeItem: () => { throw new Error('blocked') },
    }

    expect(loadQuizSession(unavailableStorage, snapshot.quizId, questions)).toBeNull()
    expect(saveQuizSession(unavailableStorage, snapshot)).toBe(false)
    expect(clearQuizSession(unavailableStorage, snapshot.quizId)).toBe(false)
  })
})
