
'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Keyboard, RotateCcw } from 'lucide-react'
import type { Flashcard, FlashcardRating } from '@/types/learning'
import { getBrowserStorage, loadFlashcards, saveFlashcards } from '@/services/local-persistence'
import { buildReviewQueue, cardStage, nextDueLabel, scheduleReview } from '@/services/spaced-repetition'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const ratings: { value: FlashcardRating; label: string; shortcut: string; tone: string }[] = [
  { value: 'again', label: 'Again', shortcut: '1', tone: 'text-red-300' },
  { value: 'hard', label: 'Hard', shortcut: '2', tone: 'text-amber-300' },
  { value: 'good', label: 'Good', shortcut: '3', tone: 'text-green-300' },
  { value: 'easy', label: 'Easy', shortcut: '4', tone: 'text-sky-300' },
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
    return <div className="mx-auto max-w-4xl space-y-5">
      <Card className="space-y-5 text-center"><Badge className="mx-auto">Review complete</Badge><h1 className="text-4xl font-semibold">Queue cleared</h1><p className="text-muted">You reviewed {reviewed} card(s). Scheduled cards now carry updated ease factors, intervals, review counts, and next review dates.</p><Button onClick={restart}><RotateCcw size={18} /> Rebuild due queue</Button></Card>
      <QueueStats queue={queue} />
    </div>
  }

  return <div className="mx-auto max-w-4xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><Badge>{cardStage(current)} card</Badge><h1 className="mt-3 text-4xl font-semibold">Daily review</h1></div><p className="flex items-center gap-2 text-sm text-muted"><Keyboard size={16} /> Space to reveal · 1-4 to rate</p></div>
    <Progress value={progress} />
    <QueueStats queue={queue} />
    <AnimatePresence mode="wait">
      <motion.div key={current.id + String(revealed)} initial={{ opacity: 0, rotateX: -6 }} animate={{ opacity: 1, rotateX: 0 }} exit={{ opacity: 0, rotateX: 6 }} transition={{ duration: 0.16 }}>
        <Card className="min-h-80 space-y-6 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">{revealed ? 'Answer' : 'Prompt'}</p>
          <p className="mx-auto max-w-2xl text-3xl font-semibold leading-tight">{revealed ? current.back : current.front}</p>
          {!revealed && <Button onClick={() => setRevealed(true)}>Show answer</Button>}
          {revealed && <div className="grid gap-3 sm:grid-cols-4">{ratings.map((rating) => <Button key={rating.value} variant="outline" onClick={() => rate(rating.value)}><span className={rating.tone}>{rating.label}</span><span className="text-xs text-muted">{rating.shortcut}</span></Button>)}</div>}
          {revealed && <p className="text-sm text-muted">Current interval: {nextDueLabel(current)} · Ease {current.easeFactor.toFixed(2)} · Reviews {current.reviewCount}</p>}
        </Card>
      </motion.div>
    </AnimatePresence>
  </div>
}

function QueueStats({ queue }: { queue: ReturnType<typeof buildReviewQueue> }) {
  const stats = [
    ['Due today', queue.dueToday.length],
    ['Overdue', queue.overdue.length],
    ['New', queue.newCards.length],
    ['Learning', queue.learning.length],
    ['Mature', queue.mature.length],
  ] as const
  return <div className="grid gap-3 sm:grid-cols-5">{stats.map(([label, value]) => <Card key={label} className="p-4 text-center"><p className="text-2xl font-semibold">{value}</p><p className="text-xs text-muted">{label}</p></Card>)}</div>
}
