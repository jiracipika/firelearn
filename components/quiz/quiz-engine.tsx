'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ChevronRight, Clock, RotateCcw, XCircle } from 'lucide-react'
import type { QuizQuestion } from '@/types/learning'
import { getBrowserStorage, recordQuizResult } from '@/services/local-persistence'
import { recordStudyActivity } from '@/services/study-activity'
import { createFireLearnBrowserSupabaseClient } from '@/services/supabase/client'
import { recordQuizAttemptInSupabase } from '@/services/supabase/progress'
import { buildQuizResult, collectQuestionBank, isAnswerCorrect, supportsMultipleSelection, type QuizAnswer, type QuizMode } from '@/services/quiz-engine'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export function QuizEngine({ title, questions, poolTotal }: { title: string; questions: QuizQuestion[]; poolTotal?: number }) {
  const [mode, setMode] = React.useState<QuizMode>('practice')
  const [index, setIndex] = React.useState(0)
  const [selected, setSelected] = React.useState<string[]>([])
  const [answers, setAnswers] = React.useState<QuizAnswer[]>([])
  const [submitted, setSubmitted] = React.useState(false)

  const bank = React.useMemo(() => collectQuestionBank(questions, mode), [mode, questions])
  const question = bank[index]
  const finished = answers.length === bank.length && index >= bank.length
  const selectedCorrect = question ? isAnswerCorrect(question, selected) : false
  const result = finished ? buildQuizResult(bank, answers) : null
  const recordedResultKey = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!result) return
    const resultKey = `${title}-${answers.length}-${result.scorePercent}`
    if (recordedResultKey.current === resultKey) return
    const attempt = { quizId: title, scorePercent: result.scorePercent, weakTopicIds: result.weakTopicIds, completedAt: new Date().toISOString() }
    const storage = getBrowserStorage()
    if (storage) {
      recordQuizResult(storage, attempt)
      recordStudyActivity(storage, { kind: 'quiz_complete', minutes: Math.max(3, Math.round(bank.length * 0.75)), entityId: title, createdAt: attempt.completedAt })
    }
    const supabase = createFireLearnBrowserSupabaseClient()
    if (supabase) void recordQuizAttemptInSupabase(supabase, attempt).catch(() => undefined)
    recordedResultKey.current = resultKey
  }, [answers.length, bank.length, result, title])

  function reset(nextMode: QuizMode = mode) {
    setMode(nextMode)
    setIndex(0)
    setSelected([])
    setAnswers([])
    setSubmitted(false)
    recordedResultKey.current = null
  }

  function toggleOption(option: string) {
    if (!question || submitted) return
    if (supportsMultipleSelection(question)) {
      setSelected((current) => current.includes(option) ? current.filter((item) => item !== option) : [...current, option])
      return
    }
    setSelected([option])
  }

  function submitAnswer() {
    if (!question || selected.length === 0 || submitted) return
    const correct = isAnswerCorrect(question, selected)
    setAnswers((current) => [...current, { questionId: question.id, selectedAnswerIds: selected, correct, topicIds: question.topicIds }])
    setSubmitted(true)
  }

  function nextQuestion() {
    setSubmitted(false)
    setSelected([])
    setIndex((current) => current + 1)
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
                  <span key={topic} className="rounded-lg border border-primary/30 bg-primary/8 px-2.5 py-1 text-xs text-red-200">{topic}</span>
                ))}
              </div>
            </div>
          )}
          <Button className="mt-8" onClick={() => reset()}><RotateCcw size={18} /> Retake quiz</Button>
        </Card>
      </div>
    )
  }

  if (!question) return <Card className="py-12 text-center text-muted-foreground">No quiz questions available.</Card>
  const progress = Math.round((answers.length / bank.length) * 100)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <Badge>{mode === 'practice' ? 'Practice mode' : 'Exam mode'}</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Question {Math.min(index + 1, bank.length)} of {bank.length}{poolTotal && poolTotal > bank.length ? ` · ${poolTotal} in pool` : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant={mode === 'practice' ? 'primary' : 'outline'} size="sm" onClick={() => reset('practice')}>Practice</Button>
          <Button variant={mode === 'exam' ? 'primary' : 'outline'} size="sm" onClick={() => reset('exam')}>Exam</Button>
        </div>
      </div>

      <Progress value={progress} />

      <AnimatePresence mode="wait">
        <motion.div key={question.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
          <Card className="space-y-5 p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-border bg-elevated/60 px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{question.type.replace('-', ' ')}</span>
              {question.timeLimitSeconds && (
                <span className="flex items-center gap-1 rounded-lg border border-border bg-elevated/60 px-2.5 py-1 text-xs text-muted-foreground"><Clock size={12} /> {question.timeLimitSeconds}s</span>
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
                      {String.fromCharCode(65 + optionIndex)}
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
                <Button onClick={submitAnswer} disabled={selected.length === 0}>Submit answer</Button>
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
