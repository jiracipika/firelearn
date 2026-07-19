'use client'

import * as React from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { QuizQuestion } from '@/types/learning'
import { isAnswerCorrect, supportsMultipleSelection } from '@/services/quiz-engine'
import { cn } from '@/lib/utils'

export function InteractiveKnowledgeCheck({ question }: { question: QuizQuestion }) {
  const [selected, setSelected] = React.useState<string[]>([])
  const [submitted, setSubmitted] = React.useState(false)

  function toggleOption(option: string) {
    if (submitted) return
    if (supportsMultipleSelection(question)) {
      setSelected((current) => current.includes(option) ? current.filter((item) => item !== option) : [...current, option])
      return
    }
    setSelected([option])
  }

  function submit() {
    if (selected.length === 0 || submitted) return
    setSubmitted(true)
  }

  function reset() {
    setSelected([])
    setSubmitted(false)
  }

  const correct = submitted && isAnswerCorrect(question, selected)

  // Keep latest handlers in refs so the keydown effect can mount once and does
  // not need to re-subscribe on every keystroke.
  const toggleOptionRef = React.useRef(toggleOption)
  const submitRef = React.useRef(submit)
  const resetRef = React.useRef(reset)
  React.useEffect(() => {
    toggleOptionRef.current = toggleOption
    submitRef.current = submit
    resetRef.current = reset
  })

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return

      const optionIndex = parseInt(event.key, 10) - 1
      const isOptionKey = optionIndex >= 0 && optionIndex < 10

      if (!submitted) {
        if (isOptionKey && optionIndex < question.options.length) {
          toggleOptionRef.current(question.options[optionIndex])
          return
        }
        if (event.key === 'Enter' && selected.length > 0) {
          event.preventDefault()
          submitRef.current()
        }
      } else if (event.key === 'Enter') {
        event.preventDefault()
        resetRef.current()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [question, selected, submitted])

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">{question.prompt}</p>
      <ul className="grid gap-2">
        {question.options.map((option, index) => {
          const active = selected.includes(option)
          const isCorrect = submitted && question.correctAnswerIds.includes(option)
          const isWrong = submitted && active && !question.correctAnswerIds.includes(option)
          return (
            <li key={option}>
              <button
                type="button"
                onClick={() => toggleOption(option)}
                disabled={submitted}
                aria-pressed={active}
                className={cn(
                  'flex w-full min-h-12 items-center gap-3 rounded-xl border p-3 text-left text-sm transition-all',
                  !submitted && active && 'border-primary/60 bg-primary/10',
                  !submitted && !active && 'border-border bg-elevated/40 hover:border-border-bright hover:bg-elevated/60',
                  isCorrect && 'border-success/50 bg-success/10',
                  isWrong && 'border-red-500/50 bg-red-500/10',
                  submitted && !isCorrect && !isWrong && 'border-border bg-elevated/20 opacity-60',
                )}
              >
                <span className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition',
                  active || isCorrect ? 'bg-primary/20 text-primary' : 'bg-elevated text-muted',
                  isCorrect && 'bg-success/20 text-success',
                  isWrong && 'bg-red-500/20 text-red-400',
                )}>
                  {index + 1}
                </span>
                <span className="flex-1 text-white">{option}</span>
                {isCorrect && <CheckCircle2 size={16} className="text-success" />}
                {isWrong && <XCircle size={16} className="text-red-400" />}
              </button>
            </li>
          )
        })}
      </ul>

      {submitted && (
        <div className={cn('rounded-xl border p-4', correct ? 'border-success/30 bg-success/8' : 'border-red-500/30 bg-red-500/8')}>
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            {correct
              ? <><CheckCircle2 size={16} className="text-success" /> Correct</>
              : <><XCircle size={16} className="text-red-400" /> Not quite</>}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{question.explanation}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!submitted
          ? <button onClick={submit} disabled={selected.length === 0} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dim disabled:opacity-40">Check answer</button>
          : <button onClick={reset} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border-bright bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:bg-elevated">Try again</button>}
        <span className="text-xs text-muted-foreground">{submitted ? 'Enter to try again' : '1-9 select · Enter to check'}</span>
      </div>
    </div>
  )
}
