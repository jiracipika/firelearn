/**
 * Persisted study-timer session helpers.
 *
 * The dashboard study timer used to live purely in React state, so a page
 * refresh or route change silently destroyed a running session. These pure
 * functions persist enough state (the epoch-ms start of the current running
 * segment plus seconds accumulated in earlier paused segments) to resume
 * across reloads, while staying fully testable without React or a DOM.
 *
 * The component layer loads the session on mount, recomputes the live elapsed
 * seconds each tick from the stored timestamp, and writes back on every
 * transition (start / pause / reset / save).
 */

import type { StorageLike } from '@/services/local-persistence'

export type StudyTimerSession = {
  /**
   * Epoch milliseconds when the current running segment started, or `null`
   * when the timer is paused. Kept in ms so a running session is correct
   * even if the tab was backgrounded and the tick interval throttled.
   */
  startedAt: number | null
  /** Whole seconds accumulated across previous (paused) running segments. */
  accumulatedSeconds: number
}

const studyTimerKey = 'firelearn.studyTimer.v1'

const emptySession: StudyTimerSession = {
  startedAt: null,
  accumulatedSeconds: 0,
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function normalizeSession(raw: unknown): StudyTimerSession {
  if (!raw || typeof raw !== 'object') return emptySession
  const candidate = raw as Partial<StudyTimerSession>
  const rawAccumulated = candidate.accumulatedSeconds
  const accumulatedSeconds = typeof rawAccumulated === 'number' && Number.isFinite(rawAccumulated)
    ? Math.max(0, Math.floor(rawAccumulated))
    : 0
  const rawStartedAt = candidate.startedAt
  const startedAt = typeof rawStartedAt === 'number' && Number.isFinite(rawStartedAt)
    ? rawStartedAt
    : null
  return { startedAt, accumulatedSeconds }
}

export function loadStudyTimerSession(storage: StorageLike): StudyTimerSession {
  return normalizeSession(safeParse(storage.getItem(studyTimerKey), null))
}

export function saveStudyTimerSession(storage: StorageLike, session: StudyTimerSession): void {
  storage.setItem(studyTimerKey, JSON.stringify(session))
}

export function clearStudyTimerSession(storage: StorageLike): void {
  storage.removeItem(studyTimerKey)
}

/**
 * Whole seconds elapsed for a session at `now` (epoch ms). A running session
 * adds the live segment (now - startedAt); a paused session returns only the
 * accumulated seconds. Always clamped to >= 0 so a clock skew or a stale
 * stored `startedAt` from the future never shows negative time.
 */
export function computeElapsedSeconds(session: StudyTimerSession, now: number = Date.now()): number {
  const accumulated = Math.max(0, Math.floor(session.accumulatedSeconds))
  if (session.startedAt == null) return accumulated
  const liveSeconds = Math.floor((now - session.startedAt) / 1000)
  return Math.max(0, accumulated + liveSeconds)
}

/** Begin (or resume) timing: stamp the current segment at `now`. */
export function startStudyTimer(session: StudyTimerSession, now: number = Date.now()): StudyTimerSession {
  if (session.startedAt != null) return session
  return { accumulatedSeconds: session.accumulatedSeconds, startedAt: now }
}

/**
 * Pause a running segment: fold the live seconds since `startedAt` into the
 * accumulator and clear `startedAt`. No-op when already paused.
 */
export function pauseStudyTimer(session: StudyTimerSession, now: number = Date.now()): StudyTimerSession {
  if (session.startedAt == null) return session
  return { accumulatedSeconds: computeElapsedSeconds(session, now), startedAt: null }
}

/** Whether the session has a running segment right now. */
export function isStudyTimerRunning(session: StudyTimerSession): boolean {
  return session.startedAt != null
}

/** Reset to a fresh empty session. */
export function resetStudyTimer(): StudyTimerSession {
  return { ...emptySession }
}
