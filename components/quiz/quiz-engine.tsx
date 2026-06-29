
'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Clock, RotateCcw, XCircle } from 'lucide-react'
import type { QuizQuestion } from '@/types/learning'
import { getBrowserStorage, recordQuizResult } from '@/services/local-persistence'
import { createFireLearnBrowserSupabaseClient } from '@/services/supabase/client'
import { recordQuizAttemptInSupabase } from '@/services/supabase/progress'
import { buildQuizResult, collectQuestionBank, isAnswerCorrect, supportsMultipleSelection, type QuizAnswer, type QuizMode } from '@/services/quiz-engine'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function QuizEngine({ title, questions }: { title: string; questions: QuizQuestion[] }) {
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
    if (storage) recordQuizResult(storage, attempt)
    const supabase = createFireLearnBrowserSupabaseClient()
    if (supabase) void recordQuizAttemptInSupabase(supabase, attempt).catch(() => undefined)
    recordedResultKey.current = resultKey
  }, [answers.length, result, title])

  function reset(nextMode = mode) {
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
    return <div className="mx-auto max-w-4xl space-y-5"><Card className="relative overflow-hidden p-8 text-center"><div className="absolute inset-x-16 top-0 h-24 bg-primary/20 blur-3xl" /><Badge className="mx-auto">{title}</Badge><h1 className="mt-5 text-6xl font-semibold tracking-[-0.05em]">{result.scorePercent}%</h1><p className="mt-2 text-muted">{result.correctAnswers} of {result.totalQuestions} correct · {result.passed ? 'passing score' : 'review recommended'}</p>{result.weakTopicIds.length > 0 && <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-left"><p className="font-semibold">Weak topics detected</p><p className="mt-2 text-sm text-muted">{result.weakTopicIds.join(', ')}</p></div>}<Button className="mt-6" onClick={() => reset()}><RotateCcw size={18} /> Retake quiz</Button></Card></div>
  }

  if (!question) return <Card>No quiz questions available.</Card>
  const progress = Math.round((answers.length / bank.length) * 100)

  return <div className="mx-auto max-w-4xl space-y-5">
    <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end"><div><Badge>{mode === 'practice' ? 'Practice mode' : 'Exam mode'}</Badge><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">{title}</h1><p className="mt-2 text-muted">Question {Math.min(index + 1, bank.length)} of {bank.length}</p></div><div className="flex gap-2"><Button variant={mode === 'practice' ? 'primary' : 'outline'} onClick={() => reset('practice')}>Practice</Button><Button variant={mode === 'exam' ? 'primary' : 'outline'} onClick={() => reset('exam')}>Exam</Button></div></div>
    <Progress value={progress} />
    <AnimatePresence mode="wait"><motion.div key={question.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}><Card className="space-y-6 p-6 md:p-7"><div className="flex flex-wrap items-center gap-2 text-xs text-muted"><span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 uppercase tracking-[0.14em]">{question.type}</span>{question.timeLimitSeconds && <span className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1"><Clock size={13} /> {question.timeLimitSeconds}s</span>}</div><h2 className="text-2xl font-semibold leading-snug tracking-tight md:text-3xl">{question.prompt}</h2><div className="grid gap-3">{question.options.map((option, optionIndex) => { const active = selected.includes(option); const correct = submitted && question.correctAnswerIds.includes(option); const wrong = submitted && active && !question.correctAnswerIds.includes(option); return <button key={option} type="button" onClick={() => toggleOption(option)} aria-pressed={active} className={`flex min-h-16 items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${active ? 'border-primary/70 bg-primary/12 shadow-[0_0_30px_rgb(255_59_34_/_0.10)]' : 'border-white/[0.08] bg-black/20 hover:bg-white/[0.055]'} ${correct ? 'border-success/70 bg-success/10' : ''} ${wrong ? 'border-red-400/70 bg-red-500/10' : ''}`}><span className="flex items-center gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.04] text-xs text-muted">{optionIndex + 1}</span>{option}</span>{correct && <CheckCircle2 className="text-success" />}{wrong && <XCircle className="text-red-300" />}</button> })}</div>{submitted && mode === 'practice' && <div className={`rounded-2xl border p-4 ${selectedCorrect ? 'border-success/40 bg-success/10' : 'border-red-400/40 bg-red-500/10'}`}><p className="font-semibold">{selectedCorrect ? 'Correct' : 'Not quite'}</p><p className="mt-2 text-sm leading-6 text-muted">{question.explanation}</p></div>}<div className="flex justify-end gap-3">{!submitted ? <Button disabled={selected.length === 0} onClick={submitAnswer}>Submit answer</Button> : <Button onClick={nextQuestion}>{index + 1 >= bank.length ? 'See results' : 'Next question'}</Button>}</div></Card></motion.div></AnimatePresence>
  </div>
}
