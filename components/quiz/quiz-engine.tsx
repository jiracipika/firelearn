'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ChevronRight, Clock, Keyboard, RotateCcw, Sparkles, Target, TrendingDown, TrendingUp, XCircle } from 'lucide-react'
import type { QuizQuestion } from '@/types/learning'
import { getBrowserStorage } from '@/services/local-persistence'
import { createOfflineProgressRepository } from '@/services/offline-progress'
import { recordQuizOutcome } from '@/services/quiz-recording'
import { createFireLearnBrowserSupabaseClient } from '@/services/supabase/client'
import { recordQuizAttemptInSupabase } from '@/services/supabase/progress'
import { buildQuizResult, collectQuestionBank, isAnswerCorrect, supportsMultipleSelection, type QuizAnswer, type QuizMode } from '@/services/quiz-engine'
import { clearQuizSession, loadQuizSession, saveQuizSession } from '@/services/quiz-session'
import { summarizeQuizSession, type QuizPerformanceBand } from '@/services/quiz-session-summary'
import { computeTimerState, formatCountdown, hasVisibleCountdown } from '@/services/quiz-timer'
import { formatTopicLabel } from '@/services/topics'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type QuizEngineProps = {
  quizId: string
  title: string
  questions: QuizQuestion[]
  poolTotal?: number
}

export function QuizEngine({ quizId, title, questions, poolTotal }: QuizEngineProps) {
  const [mode, setMode] = React.useState<QuizMode>('practice')
  const [index, setIndex] = React.useState(0)
  const [selected, setSelected] = React.useState<string[]>([])
  const [answers, setAnswers] = React.useState<QuizAnswer[]>([])
  const [submitted, setSubmitted] = React.useState(false)
  const [showReview, setShowReview] = React.useState(false)
  const [timerElapsed, setTimerElapsed] = React.useState(0)
  const [questionsOverride, setQuestionsOverride] = React.useState<QuizQuestion[] | null>(null)
  const [sessionReady, setSessionReady] = React.useState(false)
  const [resumeNotice, setResumeNotice] = React.useState(false)
  const [sessionStorageFailed, setSessionStorageFailed] = React.useState(false)

  const effectiveQuestions = questionsOverride ?? questions
  const bank = React.useMemo(() => collectQuestionBank(effectiveQuestions, mode), [mode, effectiveQuestions])
  const question = bank[index]
  const finished = answers.length === bank.length && index >= bank.length
  const selectedCorrect = question ? isAnswerCorrect(question, selected) : false
  const result = finished ? buildQuizResult(bank, answers) : null
  const sessionSummary = React.useMemo(
    () => (result ? summarizeQuizSession(bank, answers) : null),
    [result, bank, answers],
  )
  const recordedResultKey = React.useRef<string | null>(null)

  React.useEffect(() => {
    const storage = getBrowserStorage()
    const saved = storage ? loadQuizSession(storage, quizId, questions) : null
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return

      if (saved) {
        const questionById = new Map(questions.map((item) => [item.id, item]))
        const restoredQuestions = saved.activeQuestionIds
          .map((id) => questionById.get(id))
          .filter((item): item is QuizQuestion => Boolean(item))
        const usesFullBank = restoredQuestions.length === questions.length
          && restoredQuestions.every((item, itemIndex) => item.id === questions[itemIndex]?.id)

        setMode(saved.mode)
        setQuestionsOverride(usesFullBank ? null : restoredQuestions)
        setIndex(saved.index)
        setSelected(saved.selectedAnswerIds)
        setAnswers(saved.answers)
        setSubmitted(saved.submitted)
        setTimerElapsed(saved.timerElapsed)
        setResumeNotice(true)
      }

      setSessionStorageFailed(!storage)
      setSessionReady(true)
    })

    return () => { cancelled = true }
  }, [questions, quizId])

  const persistedTimerElapsed = submitted ? timerElapsed : timerElapsed - (timerElapsed % 5)
  React.useEffect(() => {
    if (!sessionReady) return
    const storage = getBrowserStorage()
    if (!storage) {
      queueMicrotask(() => setSessionStorageFailed(true))
      return
    }

    if (result || finished) {
      clearQuizSession(storage, quizId)
      return
    }

    const hasStarted = index > 0 || answers.length > 0 || selected.length > 0 || submitted || persistedTimerElapsed > 0
    if (!hasStarted) return

    const saved = saveQuizSession(storage, {
      quizId,
      mode,
      activeQuestionIds: bank.map((item) => item.id),
      index,
      selectedAnswerIds: selected,
      answers,
      submitted,
      timerElapsed: persistedTimerElapsed,
      updatedAt: new Date().toISOString(),
    })
    queueMicrotask(() => setSessionStorageFailed(!saved))
  }, [answers, bank, finished, index, mode, persistedTimerElapsed, quizId, result, selected, sessionReady, submitted])

  React.useEffect(() => {
    if (!result) return
    const resultKey = `${quizId}-${answers.length}-${result.scorePercent}`
    if (recordedResultKey.current === resultKey) return
    const attempt = { quizId, scorePercent: result.scorePercent, weakTopicIds: result.weakTopicIds, completedAt: new Date().toISOString() }
    const storage = getBrowserStorage()
    let clientMutationId: string | undefined
    if (storage) {
      recordQuizOutcome(storage, {
        quizId,
        result,
        questionCount: bank.length,
        completedAt: attempt.completedAt,
      })
      clientMutationId = createOfflineProgressRepository(storage).queueQuizAttempt(attempt)
    }
    const supabase = createFireLearnBrowserSupabaseClient()
    if (supabase) void recordQuizAttemptInSupabase(supabase, attempt, clientMutationId)
      .then(() => {
        if (storage && clientMutationId) createOfflineProgressRepository(storage).clearSyncedQueueItems([clientMutationId])
      })
      .catch(() => undefined)
    recordedResultKey.current = resultKey
  }, [answers.length, bank.length, quizId, result])

  // Per-question countdown: ticks every second while a question with a time
  // limit is showing and the answer has not been submitted yet.
  React.useEffect(() => {
    if (!sessionReady || !hasVisibleCountdown(question?.timeLimitSeconds) || submitted) return
    const interval = window.setInterval(() => setTimerElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(interval)
  }, [question?.id, question?.timeLimitSeconds, sessionReady, submitted])

  const timerState = hasVisibleCountdown(question?.timeLimitSeconds)
    ? computeTimerState(question.timeLimitSeconds, timerElapsed)
    : undefined

  // Auto-submit when the countdown reaches zero. A timed-out question is
  // recorded as incorrect (no selection), matching exam proctoring expectations.
  // The submit handler is captured in a ref so the timer effect can stay
  // focused on the countdown state without re-running on every render.
  const autoSubmitRef = React.useRef(submitAnswer)
  React.useEffect(() => {
    autoSubmitRef.current = submitAnswer
  })
  React.useEffect(() => {
    if (!timerState || timerState.urgency !== 'expired' || submitted) return
    autoSubmitRef.current(true)
  }, [timerState, submitted])

  // Keep the latest submit/toggle handlers in refs so the keydown effect can
  // stay mounted once (no listener churn on every keystroke) without pulling
  // the handlers into its dependency array and retriggering on each render.
  const toggleOptionRef = React.useRef(toggleOption)
  const submitAnswerRef = React.useRef(submitAnswer)
  React.useEffect(() => {
    toggleOptionRef.current = toggleOption
    submitAnswerRef.current = submitAnswer
  })

  function reset(nextMode: QuizMode = mode, overrideQuestions?: QuizQuestion[]) {
    const storage = getBrowserStorage()
    if (storage) clearQuizSession(storage, quizId)
    setMode(nextMode)
    setQuestionsOverride(overrideQuestions ?? null)
    setIndex(0)
    setSelected([])
    setAnswers([])
    setSubmitted(false)
    setTimerElapsed(0)
    setShowReview(false)
    setResumeNotice(false)
    recordedResultKey.current = null
  }

  function retryMissed() {
    if (!result) return
    const missedIds = new Set(answers.filter((a) => !a.correct).map((a) => a.questionId))
    const missedQuestions = bank.filter((q) => missedIds.has(q.id))
    if (missedQuestions.length === 0) return
    reset('practice', missedQuestions)
  }

  function toggleOption(option: string) {
    if (!question || submitted) return
    if (supportsMultipleSelection(question)) {
      setSelected((current) => current.includes(option) ? current.filter((item) => item !== option) : [...current, option])
      return
    }
    setSelected([option])
  }

  function submitAnswer(forcedIncorrect = false) {
    if (!question || submitted) return
    // Normal submission requires a selection; timed-out forced submissions
    // are recorded as incorrect even with no selection.
    if (!forcedIncorrect && (selected.length === 0)) return
    const correct = forcedIncorrect ? false : isAnswerCorrect(question, selected)
    setAnswers((current) => [...current, { questionId: question.id, selectedAnswerIds: forcedIncorrect ? [] : selected, correct, topicIds: question.topicIds }])
    setSubmitted(true)
  }

  function nextQuestion() {
    setSubmitted(false)
    setSelected([])
    setTimerElapsed(0)
    setIndex((current) => current + 1)
  }

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!sessionReady || result) return
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return

      const optionIndex = parseInt(event.key, 10) - 1
      const isOptionKey = optionIndex >= 0 && optionIndex < 10

      if (!submitted) {
        if (isOptionKey && question && optionIndex < question.options.length) {
          toggleOptionRef.current(question.options[optionIndex])
          return
        }
        if (event.key === 'Enter' && selected.length > 0) {
          event.preventDefault()
          submitAnswerRef.current()
        }
      } else if (event.key === 'Enter') {
        event.preventDefault()
        nextQuestion()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [question, selected, submitted, result, sessionReady])

  if (!sessionReady) {
    return <Card role="status" aria-live="polite" className="mx-auto max-w-3xl py-12 text-center text-muted-foreground">Restoring quiz progress…</Card>
  }

  if (result) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Card className="relative overflow-hidden p-8 text-center md:p-12">
          <div className="absolute inset-x-20 top-0 h-28 bg-primary/15 blur-3xl" />
          <Badge className="mx-auto">{title}</Badge>
          <div className="mt-6">
            <p className={cn('text-7xl font-bold tracking-tight md:text-8xl', result.passed ? 'text-success' : 'text-primary')}>
              {result.scorePercent}%
            </p>
            <p className="mt-3 text-base text-muted-foreground">
              {result.correctAnswers} of {result.totalQuestions} correct · {result.passed ? 'Passing score' : 'Review recommended'}
            </p>
          </div>
          {result.weakTopicIds.length > 0 && (
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-border bg-elevated/40 p-4 text-left">
              <p className="text-sm font-semibold text-white">Weak topics detected</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.weakTopicIds.map((topic) => (
                  <span key={topic} className="rounded-lg border border-primary/30 bg-primary/8 px-2.5 py-1 text-xs text-red-200">{formatTopicLabel(topic)}</span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => reset()}><RotateCcw size={18} /> Retake quiz</Button>
            {result.correctAnswers < result.totalQuestions && (
              <Button variant="secondary" onClick={retryMissed}><Target size={18} /> Retry {result.totalQuestions - result.correctAnswers} missed</Button>
            )}
            <Button variant="outline" onClick={() => setShowReview((value) => !value)}>
              {showReview ? 'Hide answer review' : `Review answers (${result.correctAnswers}/${result.totalQuestions})`}
            </Button>
          </div>
        </Card>
        {sessionSummary && <QuizSessionAnalytics summary={sessionSummary} />}
        {showReview && <QuizAnswerReview bank={bank} answers={answers} />}
      </div>
    )
  }

  if (!question) return <Card className="py-12 text-center text-muted-foreground">No quiz questions available.</Card>
  const progress = Math.round((answers.length / bank.length) * 100)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {resumeNotice && (
        <div role="status" className="flex flex-col gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-sky-100">Quiz restored</p>
            <p className="mt-1 text-sky-100/75">Continuing at question {index + 1} of {bank.length}. Progress is saved on this device for 7 days.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" size="sm" onClick={() => setResumeNotice(false)}>Dismiss</Button>
            <Button variant="outline" size="sm" onClick={() => reset(mode)}>Start over</Button>
          </div>
        </div>
      )}
      {sessionStorageFailed && (
        <div role="status" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Device progress saving is unavailable</p>
          <p className="mt-1 text-amber-100/75">Keep this tab open until you finish. Check browser storage permissions before relying on refresh recovery.</p>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <Badge>{questionsOverride ? 'Missed-questions retry' : mode === 'practice' ? 'Practice mode' : 'Exam mode'}</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Question {Math.min(index + 1, bank.length)} of {bank.length}{poolTotal && poolTotal > bank.length ? ` · ${poolTotal} in pool` : ''}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Button variant={mode === 'practice' ? 'primary' : 'outline'} size="sm" onClick={() => reset('practice')}>Practice</Button>
            <Button variant={mode === 'exam' ? 'primary' : 'outline'} size="sm" onClick={() => reset('exam')}>Exam</Button>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Keyboard size={12} /> {submitted ? 'Enter for next' : '1-9 select · Enter submit'}</p>
        </div>
      </div>

      <Progress value={progress} />

      <AnimatePresence mode="wait">
        <motion.div key={question.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
          <Card className="space-y-5 p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-border bg-elevated/60 px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{question.type.replace('-', ' ')}</span>
              {question.timeLimitSeconds && (
                <span
                  className={cn(
                    'flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs tabular-nums transition-colors',
                    timerState
                      ? timerState.urgency === 'urgent'
                        ? 'border-red-500/50 bg-red-500/15 text-red-200'
                        : timerState.urgency === 'steady'
                          ? 'border-accent/40 bg-accent/12 text-accent'
                          : 'border-border bg-elevated/60 text-muted-foreground'
                      : 'border-border bg-elevated/60 text-muted-foreground',
                  )}
                  aria-live="polite"
                >
                  <Clock size={12} /> {timerState ? formatCountdown(timerState.seconds) : `${question.timeLimitSeconds}s`}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold leading-snug tracking-tight text-white md:text-2xl">{question.prompt}</h2>

            <div className="grid gap-2.5">
              {question.options.map((option, optionIndex) => {
                const active = selected.includes(option)
                const correct = submitted && question.correctAnswerIds.includes(option)
                const wrong = submitted && active && !question.correctAnswerIds.includes(option)
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleOption(option)}
                    aria-pressed={active}
                    className={cn(
                      'flex min-h-14 items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-all',
                      !submitted && active && 'border-primary/60 bg-primary/10',
                      !submitted && !active && 'border-border bg-elevated/40 hover:border-border-bright hover:bg-elevated/60',
                      correct && 'border-success/50 bg-success/10',
                      wrong && 'border-red-500/50 bg-red-500/10',
                      submitted && !correct && !wrong && 'border-border bg-elevated/20 opacity-60'
                    )}
                  >
                    <span className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition',
                      active || correct ? 'bg-primary/20 text-primary' : 'bg-elevated text-muted',
                      correct && 'bg-success/20 text-success',
                      wrong && 'bg-red-500/20 text-red-400'
                    )}>
                      {optionIndex + 1}
                    </span>
                    <span className="flex-1 text-white">{option}</span>
                    {correct && <CheckCircle2 size={18} className="text-success" />}
                    {wrong && <XCircle size={18} className="text-red-400" />}
                  </button>
                )
              })}
            </div>

            {submitted && mode === 'practice' && (
              <div className={cn('rounded-xl border p-4', selectedCorrect ? 'border-success/30 bg-success/8' : 'border-red-500/30 bg-red-500/8')}>
                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                  {selectedCorrect ? <><CheckCircle2 size={16} className="text-success" /> Correct</> : <><XCircle size={16} className="text-red-400" /> Not quite</>}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{question.explanation}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              {!submitted ? (
                <Button onClick={() => submitAnswer()} disabled={selected.length === 0}>Submit answer</Button>
              ) : (
                <Button onClick={nextQuestion}>
                  {index + 1 < bank.length ? <>Next question <ChevronRight size={16} /></> : <>See results <ChevronRight size={16} /></>}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const performanceBandCopy: Record<QuizPerformanceBand, { label: string; tone: string; bg: string; border: string }> = {
  excellent: { label: 'Exam-ready', tone: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
  passing: { label: 'Passing', tone: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  'needs-work': { label: 'Needs work', tone: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  failing: { label: 'Review required', tone: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
}

function QuizSessionAnalytics({ summary }: { summary: import('@/services/quiz-session-summary').QuizSessionSummary }) {
  const band = performanceBandCopy[summary.performanceBand]
  const showTypeBreakdown = summary.questionTypeStats.length > 1
  const showTopicBreakdown = summary.topicStats.length > 1

  return (
    <Card className="space-y-4 p-5 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Session analytics</p>
          <h2 className="mt-1 font-bold text-white">How this attempt went</h2>
        </div>
        <Sparkles className="text-red-400" size={20} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={cn('rounded-xl border p-3 text-center', band.border, band.bg)}>
          <p className={cn('text-xs font-semibold uppercase tracking-wider', band.tone)}>{band.label}</p>
          <p className="mt-1 text-[11px] text-muted">Performance band</p>
        </div>
        <div className="rounded-xl border border-border bg-elevated/40 p-3 text-center">
          <p className="text-2xl font-bold text-white tabular-nums">{summary.accuracyPercent}%</p>
          <p className="text-[11px] text-muted">Overall accuracy</p>
        </div>
        {summary.strongestTopic && (
          <div className="rounded-xl border border-success/30 bg-success/8 p-3 text-center">
            <p className="text-sm font-bold text-success">{formatTopicLabel(summary.strongestTopic.topicId)}</p>
            <p className="text-[11px] text-muted">Strongest · {summary.strongestTopic.accuracyPercent}%</p>
          </div>
        )}
        {summary.weakestTopic && (
          <div className="rounded-xl border border-red-500/25 bg-red-500/8 p-3 text-center">
            <p className="text-sm font-bold text-red-300">{formatTopicLabel(summary.weakestTopic.topicId)}</p>
            <p className="text-[11px] text-muted">Weakest · {summary.weakestTopic.accuracyPercent}%</p>
          </div>
        )}
        {summary.strongestTopic && !summary.weakestTopic && (
          <div className="rounded-xl border border-border bg-elevated/40 p-3 text-center">
            <p className="text-2xl font-bold text-white tabular-nums">{summary.correctAnswers}</p>
            <p className="text-[11px] text-muted">Correct answers</p>
          </div>
        )}
      </div>

      {showTypeBreakdown && (
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            <TrendingUp size={12} /> Accuracy by question type
          </p>
          <div className="mt-2 space-y-2">
            {summary.questionTypeStats.map((stat) => (
              <div key={stat.type} className="rounded-lg border border-border bg-elevated/40 px-3 py-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium capitalize text-white">{stat.type.replace('-', ' ')}</span>
                  <span className={cn('tabular-nums', stat.accuracyPercent === 100 ? 'text-success' : stat.accuracyPercent < 50 ? 'text-red-400' : 'text-muted')}>
                    {stat.correct}/{stat.total} · {stat.accuracyPercent}%
                  </span>
                </div>
                <Progress value={stat.accuracyPercent} className="mt-2 h-1.5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {showTopicBreakdown && (
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            <TrendingDown size={12} /> Topic breakdown
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {summary.topicStats.map((topic) => (
              <span
                key={topic.topicId}
                className={cn(
                  'rounded-lg border px-2.5 py-1 text-xs tabular-nums',
                  topic.accuracyPercent === 100
                    ? 'border-success/30 bg-success/8 text-success'
                    : topic.accuracyPercent < 50
                      ? 'border-red-500/30 bg-red-500/8 text-red-300'
                      : 'border-border bg-elevated/40 text-white',
                )}
                title={`${topic.correct} of ${topic.total} correct`}
              >
                {formatTopicLabel(topic.topicId)} · {topic.accuracyPercent}%
              </span>
            ))}
          </div>
        </div>
      )}

      {(summary.masteredQuestionTypes.length > 0 || summary.strugglingQuestionTypes.length > 0) && (
        <p className="text-sm leading-6 text-muted-foreground">
          {summary.masteredQuestionTypes.length > 0 && (
            <>Mastered {summary.masteredQuestionTypes.map((type) => type.replace('-', ' ')).join(', ')}.</>
          )}{' '}
          {summary.strugglingQuestionTypes.length > 0 && (
            <>Focus next on {summary.strugglingQuestionTypes.map((type) => type.replace('-', ' ')).join(', ')}.</>
          )}
        </p>
      )}
    </Card>
  )
}

type ReviewFilter = 'all' | 'incorrect' | 'correct'

function QuizAnswerReview({ bank, answers }: { bank: QuizQuestion[]; answers: QuizAnswer[] }) {
  const [filter, setFilter] = React.useState<ReviewFilter>('incorrect')

  const answerByQuestion = React.useMemo(() => {
    const map = new Map<string, QuizAnswer | undefined>()
    for (const question of bank) {
      map.set(question.id, answers.find((item) => item.questionId === question.id))
    }
    return map
  }, [bank, answers])

  const filteredBank = React.useMemo(() => {
    if (filter === 'all') return bank
    return bank.filter((question) => {
      const correct = answerByQuestion.get(question.id)?.correct ?? false
      return filter === 'incorrect' ? !correct : correct
    })
  }, [bank, filter, answerByQuestion])

  const incorrectCount = bank.filter((q) => !(answerByQuestion.get(q.id)?.correct ?? false)).length
  const correctCount = bank.length - incorrectCount

  return (
    <Card className="space-y-4 p-5 md:p-7">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Answer review</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">Question-by-question breakdown</h2>
        <p className="mt-1 text-sm text-muted-foreground">Each question with the correct answer, your response, and the explanation.</p>
      </div>

      <FilterRadioGroup value={filter} onChange={setFilter} options={[
        { value: 'incorrect', label: 'Incorrect', count: incorrectCount, accent: 'danger' },
        { value: 'correct', label: 'Correct', count: correctCount, accent: 'success' },
        { value: 'all', label: 'All', count: bank.length, accent: 'neutral' },
      ]} />

      <div className="space-y-4" role="region" aria-label="Filtered review questions">
        {filteredBank.map((question) => {
          const originalIndex = bank.indexOf(question)
          const answer = answerByQuestion.get(question.id)
          const correct = answer?.correct ?? false
          return (
            <div key={question.id} className="rounded-2xl border border-border bg-elevated/40 p-4">
              <div className="flex items-start gap-2.5">
                <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold', correct ? 'bg-success/20 text-success' : 'bg-red-500/20 text-red-400')}>
                  {originalIndex + 1}
                </span>
                <h3 className="flex-1 text-sm font-bold leading-snug text-white">{question.prompt}</h3>
                {correct ? <CheckCircle2 size={18} className="shrink-0 text-success" /> : <XCircle size={18} className="shrink-0 text-red-400" />}
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted">{question.type.replace('-', ' ')}</p>
              <div className="mt-3 grid gap-1.5">
                {question.options.map((option, optionIndex) => {
                  const isCorrect = question.correctAnswerIds.includes(option)
                  const youPicked = answer?.selectedAnswerIds.includes(option)
                  return (
                    <div
                      key={option}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm',
                        isCorrect ? 'border-success/40 bg-success/8 text-white' : youPicked ? 'border-red-500/40 bg-red-500/8 text-white' : 'border-border bg-elevated/20 text-muted-foreground'
                      )}
                    >
                      <span className={cn('flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold', isCorrect ? 'bg-success/30 text-success' : youPicked ? 'bg-red-500/30 text-red-400' : 'bg-elevated text-muted')}>
                        {optionIndex + 1}
                      </span>
                      <span className="flex-1">{option}</span>
                      {isCorrect && <span className="text-[10px] font-bold uppercase text-success">Correct</span>}
                      {youPicked && !isCorrect && <span className="text-[10px] font-bold uppercase text-red-400">Your pick</span>}
                      {youPicked && isCorrect && <span className="text-[10px] font-bold uppercase text-success">Your pick</span>}
                    </div>
                  )
                })}
              </div>
              {!answer && <p className="mt-3 text-xs text-muted">Not answered.</p>}
              {answer && !correct && (
                <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5 text-xs leading-5 text-red-200">
                  You selected: {answer.selectedAnswerIds.length > 0 ? answer.selectedAnswerIds.map((id) => question.options.find((o) => o === id)).join(', ') : 'None'}
                </p>
              )}
              <p className="mt-3 rounded-lg border border-border bg-background/40 p-2.5 text-xs leading-5 text-muted-foreground">
                <span className="font-semibold text-white">Explanation: </span>{question.explanation}
              </p>
              {question.topicIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {question.topicIds.map((topic) => (
                    <span key={topic} className="rounded border border-border bg-elevated/40 px-1.5 py-0.5 text-[10px] text-muted">{formatTopicLabel(topic)}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {filteredBank.length === 0 && (
        <p className="rounded-lg border border-success/30 bg-success/5 p-4 text-center text-sm text-success">
          No questions in this filter — you answered everything correctly!
        </p>
      )}
    </Card>
  )
}

type FilterAccent = 'danger' | 'success' | 'neutral'

type FilterOption = {
  value: ReviewFilter
  label: string
  count: number
  accent: FilterAccent
}

const accentActive: Record<FilterAccent, string> = {
  danger: 'border-red-500/50 bg-red-500/15 text-red-200',
  success: 'border-success/50 bg-success/15 text-success',
  neutral: 'border-border bg-elevated/60 text-white',
}

const accentCheckedIcon: Record<FilterAccent, string> = {
  danger: 'border-red-400/60 bg-red-500 text-white',
  success: 'border-success/60 bg-success text-black',
  neutral: 'border-border-bright bg-white text-black',
}

function accentForChecked(checked: boolean, accent: FilterAccent) {
  return checked ? accentCheckedIcon[accent] : 'border-border bg-transparent'
}

/**
 * Single-select filter for the answer review.
 *
 * Uses radiogroup/radio semantics (not tablist) because this is a one-choice
 * filter that swaps the contents of the labelled region below, not a panel
 * navigation widget. Arrow keys move between options and Home/End jump to the
 * ends, matching the WAI-ARIA radiogroup keyboard pattern. Roving tabindex
 * keeps only one option in the tab order.
 */
function FilterRadioGroup({ value, onChange, options }: { value: ReviewFilter; onChange: (next: ReviewFilter) => void; options: FilterOption[] }) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value))

  function focusOption(index: number) {
    const clamped = (index + options.length) % options.length
    const node = refs.current[clamped]
    node?.focus()
    onChange(options[clamped].value)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        focusOption(activeIndex + 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        focusOption(activeIndex - 1)
        break
      case 'Home':
        event.preventDefault()
        focusOption(0)
        break
      case 'End':
        event.preventDefault()
        focusOption(options.length - 1)
        break
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Filter review by outcome" onKeyDown={onKeyDown}>
      {options.map((option, index) => {
        const checked = option.value === value
        return (
          <button
            key={option.value}
            ref={(node) => { refs.current[index] = node }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => { onChange(option.value); refs.current[index]?.focus() }}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              checked ? accentActive[option.accent] : 'border-border bg-transparent text-muted-foreground hover:border-border/80 hover:text-white',
            )}
          >
            <span aria-hidden className={cn('flex size-3 shrink-0 items-center justify-center rounded-full border transition-colors', accentForChecked(checked, option.accent))}>
              {checked && <span className="size-1.5 rounded-full bg-current" />}
            </span>
            {option.label}
            <span className="rounded-full bg-black/30 px-1.5 text-[10px] tabular-nums">{option.count}</span>
          </button>
        )
      })}
    </div>
  )
}
