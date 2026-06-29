'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Keyboard, RotateCcw, Sparkles } from 'lucide-react'
import type { Flashcard, FlashcardRating } from '@/types/learning'
import { getBrowserStorage, loadFlashcards, saveFlashcards } from '@/services/local-persistence'
import { buildReviewQueue, cardStage, nextDueLabel, scheduleReview } from '@/services/spaced-repetition'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const ratings: { value: FlashcardRating; label: string; shortcut: string; tone: string; border: string; bg: string }[] = [
  { value: 'again', label: 'Again', shortcut: '1', tone: 'text-red-400', border: 'border-red-500/30', bg: 'hover:bg-red-500/8' },
  { value: 'hard', label: 'Hard', shortcut: '2', tone: 'text-amber-400', border: 'border-amber-500/30', bg: 'hover:bg-amber-500/8' },
  { value: 'good', label: 'Good', shortcut: '3', tone: 'text-green-400', border: 'border-green-500/30', bg: 'hover:bg-green-500/8' },
  { value: 'easy', label: 'Easy', shortcut: '4', tone: 'text-sky-400', border: 'border-sky-500/30', bg: 'hover:bg-sky-500/8' },
]

export function FlashcardReview({ initialCards }: { initialCards: Flashcard[] }) {
  const [cards, setCards] = React.useState(initialCards)
  const [reviewIds, setReviewIds] = React.useState(() => initialCards.filter((card) => card.reviewCount === 0 || new Date(card.nextReview).getTime() <= Date.now()).map((card) => card.id))
  const [index, setIndex] = React.useState(0)
  const [revealed, setRevealed] = React.useState(false)
  const [reviewed, setReviewed] = React.useState(0)

  React.useEffect(() => {
    const storage = getBrowserStorage()
    if (!storage) return
    window.queueMicrotask(() => {
      const storedCards = loadFlashcards(storage)
      const mergedCards = initialCards.map((card) => storedCards[card.id] ?? card)
      setCards(mergedCards)
      setReviewIds(mergedCards.filter((card) => card.reviewCount === 0 || new Date(card.nextReview).getTime() <= Date.now()).map((card) => card.id))
    })
  }, [initialCards])

  const queue = buildReviewQueue(cards)
  const current = cards.find((card) => card.id === reviewIds[index])
  const complete = !current
  const progress = reviewIds.length === 0 ? 100 : Math.round((reviewed / reviewIds.length) * 100)

  const rate = React.useCallback((rating: FlashcardRating) => {
    if (!current || !revealed) return
    setCards((existing) => {
      const nextCards = existing.map((card) => card.id === current.id ? scheduleReview(card, rating) : card)
      const storage = getBrowserStorage()
      if (storage) saveFlashcards(storage, nextCards)
      return nextCards
    })
    setRevealed(false)
    setReviewed((value) => value + 1)
    window.setTimeout(() => setIndex((value) => value + 1), 120)
  }, [current, revealed])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        setRevealed(true)
      }
      const rating = ratings.find((item) => item.shortcut === event.key)
      if (rating) rate(rating.value)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [rate])

  function restart() {
    const dueIds = cards.filter((card) => card.reviewCount === 0 || new Date(card.nextReview).getTime() <= Date.now()).map((card) => card.id)
    setReviewIds(dueIds)
    setIndex(0)
    setReviewed(0)
    setRevealed(false)
  }

  if (complete) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Card className="relative overflow-hidden p-8 text-center md:p-10">
          <div className="absolute inset-x-20 top-0 h-24 bg-success/15 blur-3xl" />
          <Badge className="mx-auto">Review complete</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">Queue cleared</h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">You reviewed {reviewed} card(s). Scheduled cards now carry updated ease factors, intervals, and next review dates.</p>
          <Button className="mt-6" onClick={restart}><RotateCcw size={18} /> Rebuild due queue</Button>
        </Card>
        <QueueStats queue={queue} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <Badge>{cardStage(current)} card</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">Daily review</h1>
          <p className="mt-1 text-sm text-muted-foreground">Spaced repetition for high-recall firefighter knowledge.</p>
        </div>
        <p className="flex items-center gap-2 rounded-xl border border-border bg-elevated/40 px-3 py-2 text-xs text-muted-foreground"><Keyboard size={14} /> Space to reveal · 1-4 to rate</p>
      </div>

      <Progress value={progress} />
      <QueueStats queue={queue} />

      <AnimatePresence mode="wait">
        <motion.div key={current.id + String(revealed)} initial={{ opacity: 0, rotateX: -6, y: 8 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} exit={{ opacity: 0, rotateX: 6, y: -8 }} transition={{ duration: 0.16 }}>
          <Card className="relative min-h-80 overflow-hidden p-8 text-center md:p-12">
            <div className="absolute inset-x-20 top-0 h-24 bg-primary/10 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{revealed ? 'Answer' : 'Prompt'}</p>
            <p className="mx-auto mt-8 max-w-2xl text-2xl font-bold leading-snug tracking-tight text-white md:text-3xl">{revealed ? current.back : current.front}</p>
            {!revealed && <Button className="mt-8" onClick={() => setRevealed(true)}>Show answer <Sparkles size={16} /></Button>}
            {revealed && (
              <div className="mt-8 grid gap-2.5 sm:grid-cols-4">
                {ratings.map((rating) => (
                  <button
                    key={rating.value}
                    onClick={() => rate(rating.value)}
                    className={cn('flex flex-col items-center gap-1 rounded-xl border border-border bg-elevated/40 py-3 transition', rating.border, rating.bg)}
                  >
                    <span className={cn('text-sm font-bold', rating.tone)}>{rating.label}</span>
                    <span className="text-xs text-muted">{rating.shortcut}</span>
                  </button>
                ))}
              </div>
            )}
            {revealed && <p className="mt-5 text-xs text-muted">Interval: {nextDueLabel(current)} · Ease {current.easeFactor.toFixed(2)} · Reviews {current.reviewCount}</p>}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function QueueStats({ queue }: { queue: ReturnType<typeof buildReviewQueue> }) {
  const stats = [['Due', queue.dueToday.length], ['Overdue', queue.overdue.length], ['New', queue.newCards.length], ['Learning', queue.learning.length], ['Mature', queue.mature.length]] as const
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
      {stats.map(([label, value]) => (
        <Card key={label} className="p-3 text-center">
          <p className="text-xl font-bold text-white">{value}</p>
          <p className="text-xs text-muted">{label}</p>
        </Card>
      ))}
    </div>
  )
}
