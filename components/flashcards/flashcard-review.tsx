'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Keyboard, RotateCcw, Sparkles } from 'lucide-react'
import type { Flashcard, FlashcardRating } from '@/types/learning'
import { getBrowserStorage, loadFlashcards, saveFlashcards } from '@/services/local-persistence'
import { recordStudyActivity } from '@/services/study-activity'
import { createOfflineProgressRepository } from '@/services/offline-progress'
import { createFireLearnBrowserSupabaseClient } from '@/services/supabase/client'
import { recordFlashcardReviewInSupabase } from '@/services/supabase/progress'
import { buildReviewQueue, cardStage, nextDueLabel, scheduleReview } from '@/services/spaced-repetition'
import { summarizeFlashcardSession, type FlashcardReviewEvent } from '@/services/flashcard-session'
import { clearFlashcardReviewSession, loadFlashcardReviewSession, saveFlashcardReviewSession } from '@/services/flashcard-review-session'
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

export function FlashcardReview({ initialCards, sessionId }: { initialCards: Flashcard[]; sessionId: string }) {
  const [cards, setCards] = React.useState(initialCards)
  const [reviewIds, setReviewIds] = React.useState(() => initialCards.filter((card) => card.reviewCount === 0 || new Date(card.nextReview).getTime() <= Date.now()).map((card) => card.id))
  const [index, setIndex] = React.useState(0)
  const [revealed, setRevealed] = React.useState(false)
  const [reviewed, setReviewed] = React.useState(0)
  const [reviewEvents, setReviewEvents] = React.useState<FlashcardReviewEvent[]>([])
  const [sessionReady, setSessionReady] = React.useState(false)
  const [resumeNotice, setResumeNotice] = React.useState(false)
  const [sessionStorageFailed, setSessionStorageFailed] = React.useState(false)
  const ratingInProgress = React.useRef(false)

  React.useEffect(() => {
    const storage = getBrowserStorage()
    if (!storage) {
      window.queueMicrotask(() => {
        setSessionStorageFailed(true)
        setSessionReady(true)
      })
      return
    }
    window.queueMicrotask(() => {
      const storedCards = loadFlashcards(storage)
      const mergedCards = initialCards.map((card) => storedCards[card.id] ?? card)
      const saved = loadFlashcardReviewSession(storage, sessionId, initialCards)
      setCards(mergedCards)
      if (saved) {
        setReviewIds(saved.reviewIds)
        setIndex(saved.index)
        setReviewed(saved.index)
        setReviewEvents(saved.reviewEvents)
        setResumeNotice(true)
      } else {
        setReviewIds(mergedCards.filter((card) => card.reviewCount === 0 || new Date(card.nextReview).getTime() <= Date.now()).map((card) => card.id))
      }
      setSessionReady(true)
    })
  }, [initialCards, sessionId])

  React.useEffect(() => {
    if (!sessionReady) return
    const storage = getBrowserStorage()
    if (!storage) return
    if (reviewIds.length === 0 || index >= reviewIds.length) {
      clearFlashcardReviewSession(storage, sessionId)
      return
    }
    if (index === 0) return

    const saved = saveFlashcardReviewSession(storage, {
      sessionId,
      reviewIds,
      index,
      reviewEvents,
      updatedAt: new Date().toISOString(),
    })
    window.queueMicrotask(() => setSessionStorageFailed(!saved))
  }, [index, reviewEvents, reviewIds, sessionId, sessionReady])

  const queue = buildReviewQueue(cards)
  const current = cards.find((card) => card.id === reviewIds[index])
  const complete = !current
  const progress = reviewIds.length === 0 ? 100 : Math.round((reviewed / reviewIds.length) * 100)

  React.useEffect(() => {
    ratingInProgress.current = false
  }, [current?.id])

  const rate = React.useCallback((rating: FlashcardRating) => {
    if (!current || !revealed || ratingInProgress.current) return
    ratingInProgress.current = true

    const reviewedAt = new Date()
    const updatedCard = scheduleReview(current, rating, reviewedAt)
    const nextCards = cards.map((card) => card.id === current.id ? updatedCard : card)
    const storage = getBrowserStorage()

    setCards(nextCards)
    if (storage) {
      saveFlashcards(storage, nextCards)
      recordStudyActivity(storage, { kind: 'flashcard_review', minutes: 1, entityId: current.id, createdAt: reviewedAt.toISOString() })
    }

    const review = {
      cardId: updatedCard.id,
      rating,
      easeFactor: updatedCard.easeFactor,
      intervalDays: updatedCard.intervalDays,
      reviewCount: updatedCard.reviewCount,
      nextReview: updatedCard.nextReview,
      reviewedAt: updatedCard.lastReviewed ?? reviewedAt.toISOString(),
    }
    const clientMutationId = storage
      ? createOfflineProgressRepository(storage).queueFlashcardReview(review)
      : undefined
    const supabase = createFireLearnBrowserSupabaseClient()
    if (supabase) {
      void recordFlashcardReviewInSupabase(supabase, review, clientMutationId)
        .then(() => {
          if (storage && clientMutationId) createOfflineProgressRepository(storage).clearSyncedQueueItems([clientMutationId])
        })
        .catch(() => undefined)
    }
    setReviewEvents((events) => [...events, {
      flashcardId: updatedCard.id,
      rating,
      reviewedAt: updatedCard.lastReviewed ?? reviewedAt.toISOString(),
      nextReview: updatedCard.nextReview,
    }])
    setRevealed(false)
    setReviewed((value) => value + 1)
    setIndex((value) => value + 1)
  }, [cards, current, revealed])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // Ignore shortcuts when the user is typing in a form field so we do not
      // steal Space/Enter from inputs (matches the catalog `/` shortcut guard).
      const target = event.target as HTMLElement | null
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if (typing) return
      // Ignore modifier-chorded keys (e.g. Ctrl/Cmd/Alt+digit for browser
      // shortcuts, Shift+1 = "!") so we only act on clean number presses.
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        setRevealed(true)
        return
      }
      if (event.shiftKey) return
      const rating = ratings.find((item) => item.shortcut === event.key)
      if (rating) rate(rating.value)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [rate])

  function restart() {
    const storage = getBrowserStorage()
    if (storage) clearFlashcardReviewSession(storage, sessionId)
    const dueIds = cards.filter((card) => card.reviewCount === 0 || new Date(card.nextReview).getTime() <= Date.now()).map((card) => card.id)
    setReviewIds(dueIds)
    setIndex(0)
    setReviewed(0)
    setRevealed(false)
    setReviewEvents([])
    setResumeNotice(false)
  }

  if (!sessionReady) {
    return <Card role="status" aria-live="polite" className="mx-auto max-w-4xl py-12 text-center text-muted-foreground">Restoring flashcard progress…</Card>
  }

  if (complete) {
    const sessionSummary = summarizeFlashcardSession(reviewEvents)
    const retentionTone = sessionSummary.retentionPercent >= 80 ? 'text-success'
      : sessionSummary.retentionPercent >= 60 ? 'text-amber-400'
      : 'text-red-400'
    const againTone = sessionSummary.againRatePercent <= 10 ? 'text-success'
      : sessionSummary.againRatePercent <= 25 ? 'text-amber-400'
      : 'text-red-400'
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Card className="relative overflow-hidden p-8 text-center md:p-10">
          <div className="absolute inset-x-20 top-0 h-24 bg-success/15 blur-3xl" />
          <Badge className="mx-auto">Review complete</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">Queue cleared</h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">You reviewed {reviewed} card(s). Scheduled cards now carry updated ease factors, intervals, and next review dates.</p>
          <Button className="mt-6" onClick={restart}><RotateCcw size={18} /> Rebuild due queue</Button>
        </Card>
        {sessionSummary.reviewedCount > 0 && (
          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Session analytics</p>
                <h2 className="mt-1 font-bold text-white">How this rep went</h2>
              </div>
              <Sparkles className="text-red-400" size={20} />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-elevated/40 p-3 text-center">
                <p className={cn('text-2xl font-bold', retentionTone)}>{sessionSummary.retentionPercent}%</p>
                <p className="text-xs text-muted">Retention</p>
              </div>
              <div className="rounded-xl border border-border bg-elevated/40 p-3 text-center">
                <p className={cn('text-2xl font-bold', againTone)}>{sessionSummary.againRatePercent}%</p>
                <p className="text-xs text-muted">Again rate</p>
              </div>
              <div className="rounded-xl border border-border bg-elevated/40 p-3 text-center">
                <p className="text-2xl font-bold text-white">{sessionSummary.ratingCounts.good + sessionSummary.ratingCounts.easy}</p>
                <p className="text-xs text-muted">Good/Easy</p>
              </div>
              <div className="rounded-xl border border-border bg-elevated/40 p-3 text-center">
                <p className="text-2xl font-bold text-white">{sessionSummary.difficultFlashcardIds.length}</p>
                <p className="text-xs text-muted">Difficult</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {sessionSummary.difficultFlashcardIds.length > 0
                ? `${sessionSummary.difficultFlashcardIds.length} card${sessionSummary.difficultFlashcardIds.length === 1 ? '' : 's'} flagged for extra reps (rated Again or Hard). They will resurface sooner with shorter intervals.`
                : 'No cards flagged as difficult. Your schedule advances cleanly — keep the streak.'}
              {sessionSummary.nextDueAt && ` Next review: ${new Date(sessionSummary.nextDueAt).toLocaleDateString()}.`}
            </p>
          </Card>
        )}
        <QueueStats queue={queue} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {resumeNotice && (
        <div role="status" className="flex flex-col gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-sky-100">Flashcard review restored</p>
            <p className="mt-1 text-sky-100/75">Continuing at card {index + 1} of {reviewIds.length}. This device keeps unfinished sessions for 7 days.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" size="sm" onClick={() => setResumeNotice(false)}>Dismiss</Button>
            <Button variant="outline" size="sm" onClick={restart}>Restart due queue</Button>
          </div>
        </div>
      )}
      {sessionStorageFailed && (
        <div role="status" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Device session recovery is unavailable</p>
          <p className="mt-1 text-amber-100/75">Keep this tab open until you finish. Completed ratings will still sync to Supabase when a connection and signed-in session are available.</p>
        </div>
      )}
      {/* Polite live region so screen readers announce each card transition and
          reveal/rate action. Visually hidden, not suppressed. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Card {index + 1} of {reviewIds.length}. {revealed ? `Answer: ${current.back}` : `Prompt: ${current.front}`}
      </p>
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <Badge>{cardStage(current)} card</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">Daily review</h1>
          <p className="mt-1 text-sm text-muted-foreground">Spaced repetition for high-recall firefighter knowledge.</p>
        </div>
        <p className="flex items-center gap-2 rounded-xl border border-border bg-elevated/40 px-3 py-2 text-xs text-muted-foreground"><Keyboard size={14} /> Space to reveal · 1-4 to rate</p>
      </div>

      <Progress value={progress} />
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span aria-live="polite">{reviewed} of {reviewIds.length} reviewed</span>
        <span>Card {index + 1} of {reviewIds.length}</span>
      </div>
      <QueueStats queue={queue} />

      <AnimatePresence mode="wait">
        <motion.div key={current.id + String(revealed)} initial={{ opacity: 0, rotateX: -6, y: 8 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} exit={{ opacity: 0, rotateX: 6, y: -8 }} transition={{ duration: 0.16 }}>
          <Card className="relative min-h-80 overflow-hidden p-8 text-center md:p-12">
            <div className="absolute inset-x-20 top-0 h-24 bg-primary/10 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{revealed ? 'Answer' : 'Prompt'}</p>
            <p className="mx-auto mt-8 max-w-2xl text-2xl font-bold leading-snug tracking-tight text-white md:text-3xl">{revealed ? current.back : current.front}</p>
            {!revealed && <Button className="mt-8" onClick={() => setRevealed(true)}>Show answer <Sparkles size={16} /></Button>}
            {revealed && (
              <div className="mt-8 grid gap-2.5 sm:grid-cols-4" role="group" aria-label="Rate this card">
                {ratings.map((rating) => (
                  <button
                    key={rating.value}
                    type="button"
                    onClick={() => rate(rating.value)}
                    aria-label={`Rate ${rating.label.toLowerCase()} (press ${rating.shortcut})`}
                    aria-keyshortcuts={rating.shortcut}
                    className={cn('flex flex-col items-center gap-1 rounded-xl border border-border bg-elevated/40 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60', rating.border, rating.bg)}
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
