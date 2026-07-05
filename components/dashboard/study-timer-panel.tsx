'use client'

import * as React from 'react'
import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { getBrowserStorage } from '@/services/local-persistence'
import {
  computeElapsedSeconds,
  isStudyTimerRunning,
  loadStudyTimerSession,
  pauseStudyTimer,
  resetStudyTimer,
  saveStudyTimerSession,
  startStudyTimer,
  type StudyTimerSession,
} from '@/services/study-timer'
import { useStudyActivity } from '@/hooks/use-study-activity'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function formatSeconds(totalSeconds: number) {
  const safe = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0')
  const seconds = (safe % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

const TICK_MS = 1000

export function StudyTimerPanel() {
  const { record } = useStudyActivity()

  // Restore any in-flight session on mount via a lazy initializer (same pattern
  // as the theme toggle in app-shell) so a refresh or route change does not
  // silently discard a running timer. On the server, getBrowserStorage returns
  // undefined and we fall back to a fresh paused session.
  const [session, setSession] = React.useState<StudyTimerSession>(() => {
    const storage = getBrowserStorage()
    return storage ? loadStudyTimerSession(storage) : { startedAt: null, accumulatedSeconds: 0 }
  })
  const [seconds, setSeconds] = React.useState(() => computeElapsedSeconds(session))

  const running = isStudyTimerRunning(session)

  // Persist every session transition so the state survives reloads.
  const persist = React.useCallback((next: StudyTimerSession) => {
    setSession(next)
    setSeconds(computeElapsedSeconds(next))
    const storage = getBrowserStorage()
    if (storage) saveStudyTimerSession(storage, next)
  }, [])

  // While running, recompute the display each second from the wall clock so it
  // keeps counting even if the tab was backgrounded and the tick throttled.
  React.useEffect(() => {
    if (!running) return
    const interval = window.setInterval(() => setSeconds(computeElapsedSeconds(session)), TICK_MS)
    return () => window.clearInterval(interval)
  }, [running, session])

  function toggle() {
    persist(running ? pauseStudyTimer(session) : startStudyTimer(session))
  }

  function saveSession() {
    const final = running ? pauseStudyTimer(session) : session
    const elapsed = computeElapsedSeconds(final)
    if (elapsed > 0) {
      const minutes = Math.max(1, Math.round(elapsed / 60))
      record({ kind: 'study_timer', minutes })
    }
    persist(resetStudyTimer())
  }

  function reset() {
    persist(resetStudyTimer())
  }

  return <Card className="space-y-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 font-bold text-white"><Timer size={18} className="text-red-400" /> Study timer</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{running ? 'Counting — safely close this tab and resume anytime.' : 'Track real minutes for streaks and weekly activity.'}</p>
      </div>
      <span className="font-mono text-3xl font-bold text-white" aria-live="polite">{formatSeconds(seconds)}</span>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={toggle}>
        {running ? <><Pause size={16} /> Pause</> : <><Play size={16} /> {seconds > 0 ? 'Resume' : 'Start'}</>}
      </Button>
      <Button size="sm" variant="outline" disabled={seconds === 0} onClick={saveSession}>Save session</Button>
      <Button size="sm" variant="ghost" disabled={seconds === 0} onClick={reset}><RotateCcw size={16} /> Reset</Button>
    </div>
  </Card>
}
