import { describe, expect, it } from 'vitest'
import type { StudyTimerSession } from '@/services/study-timer'
import {
  clearStudyTimerSession,
  computeElapsedSeconds,
  isStudyTimerRunning,
  loadStudyTimerSession,
  pauseStudyTimer,
  resetStudyTimer,
  saveStudyTimerSession,
  startStudyTimer,
} from '@/services/study-timer'
import { createMemoryStorage } from '@/services/local-persistence'

const T0 = 1_700_000_000_000

describe('study timer persistence', () => {
  it('returns an empty paused session for fresh storage', () => {
    const storage = createMemoryStorage()
    const session = loadStudyTimerSession(storage)
    expect(session).toEqual({ startedAt: null, accumulatedSeconds: 0 })
    expect(isStudyTimerRunning(session)).toBe(false)
  })

  it('round-trips a running session through save/load', () => {
    const storage = createMemoryStorage()
    const running: StudyTimerSession = { startedAt: T0, accumulatedSeconds: 120 }
    saveStudyTimerSession(storage, running)
    expect(loadStudyTimerSession(storage)).toEqual(running)
    expect(isStudyTimerRunning(loadStudyTimerSession(storage))).toBe(true)
  })

  it('treats corrupted JSON as an empty session', () => {
    const storage = createMemoryStorage()
    storage.setItem('firelearn.studyTimer.v1', 'not-json')
    expect(loadStudyTimerSession(storage)).toEqual({ startedAt: null, accumulatedSeconds: 0 })
  })

  it('normalizes negative / malformed payloads to safe defaults', () => {
    const storage = createMemoryStorage()
    storage.setItem('firelearn.studyTimer.v1', JSON.stringify({ startedAt: 'oops', accumulatedSeconds: -40 }))
    expect(loadStudyTimerSession(storage)).toEqual({ startedAt: null, accumulatedSeconds: 0 })
  })

  it('clamps a finite but fractional accumulated value to whole seconds', () => {
    const storage = createMemoryStorage()
    storage.setItem('firelearn.studyTimer.v1', JSON.stringify({ startedAt: null, accumulatedSeconds: 12.9 }))
    expect(loadStudyTimerSession(storage).accumulatedSeconds).toBe(12)
  })

  it('clears the stored session', () => {
    const storage = createMemoryStorage()
    saveStudyTimerSession(storage, { startedAt: T0, accumulatedSeconds: 10 })
    clearStudyTimerSession(storage)
    expect(loadStudyTimerSession(storage)).toEqual({ startedAt: null, accumulatedSeconds: 0 })
  })
})

describe('study timer transitions', () => {
  it('start stamps the running segment without double-counting', () => {
    const paused: StudyTimerSession = { startedAt: null, accumulatedSeconds: 60 }
    const started = startStudyTimer(paused, T0)
    expect(started).toEqual({ startedAt: T0, accumulatedSeconds: 60 })

    // Calling start again is a no-op (segment already running).
    expect(startStudyTimer(started, T0 + 5_000)).toEqual(started)
  })

  it('pause folds the live segment into the accumulator', () => {
    const running: StudyTimerSession = { startedAt: T0, accumulatedSeconds: 90 }
    const paused = pauseStudyTimer(running, T0 + 30_000)
    expect(paused).toEqual({ startedAt: null, accumulatedSeconds: 120 })
    // Pausing an already-paused session is a no-op.
    expect(pauseStudyTimer(paused, T0 + 60_000)).toEqual(paused)
  })

  it('start → pause → start accumulates correctly across two segments', () => {
    const initial: StudyTimerSession = { startedAt: null, accumulatedSeconds: 0 }

    const firstStarted = startStudyTimer(initial, T0)
    const afterFirstSegment = pauseStudyTimer(firstStarted, T0 + 45_000)
    expect(afterFirstSegment.accumulatedSeconds).toBe(45)

    const secondStarted = startStudyTimer(afterFirstSegment, T0 + 120_000)
    const afterSecondSegment = pauseStudyTimer(secondStarted, T0 + 120_000 + 15_000)
    expect(afterSecondSegment).toEqual({ startedAt: null, accumulatedSeconds: 60 })
  })

  it('computeElapsedSeconds reads live time for a running session', () => {
    const running: StudyTimerSession = { startedAt: T0, accumulatedSeconds: 60 }
    expect(computeElapsedSeconds(running, T0)).toBe(60)
    expect(computeElapsedSeconds(running, T0 + 1_000)).toBe(61)
    expect(computeElapsedSeconds(running, T0 + 39_999)).toBe(99) // floor, not round
    expect(computeElapsedSeconds(running, T0 + 40_000)).toBe(100)
  })

  it('computeElapsedSeconds ignores the clock when paused', () => {
    const paused: StudyTimerSession = { startedAt: null, accumulatedSeconds: 42 }
    expect(computeElapsedSeconds(paused, T0)).toBe(42)
    expect(computeElapsedSeconds(paused, T0 + 60_000)).toBe(42)
  })

  it('computeElapsedSeconds never returns negative for a future-dated startedAt', () => {
    const skewed: StudyTimerSession = { startedAt: T0 + 60_000, accumulatedSeconds: 0 }
    expect(computeElapsedSeconds(skewed, T0)).toBe(0)
  })

  it('reset yields a fresh paused empty session', () => {
    expect(resetStudyTimer()).toEqual({ startedAt: null, accumulatedSeconds: 0 })
    expect(isStudyTimerRunning(resetStudyTimer())).toBe(false)
  })

  it('a full start → save → reload → resume cycle survives storage', () => {
    const storage = createMemoryStorage()

    const started = startStudyTimer(loadStudyTimerSession(storage), T0)
    saveStudyTimerSession(storage, started)
    expect(isStudyTimerRunning(loadStudyTimerSession(storage))).toBe(true)

    // Simulate a reload 90s later: elapsed should account for wall-clock time.
    const reloaded = loadStudyTimerSession(storage)
    expect(computeElapsedSeconds(reloaded, T0 + 90_000)).toBe(90)

    const paused = pauseStudyTimer(reloaded, T0 + 90_000)
    saveStudyTimerSession(storage, paused)
    expect(loadStudyTimerSession(storage)).toEqual({ startedAt: null, accumulatedSeconds: 90 })
  })
})
