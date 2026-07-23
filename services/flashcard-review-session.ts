import type { Flashcard } from '@/types/learning'
import type { StorageLike } from '@/services/local-persistence'
import type { FlashcardReviewEvent, FlashcardReviewRating } from '@/services/flashcard-session'

const flashcardSessionsKey = 'firelearn.flashcardSessions.v1'
const maxSessionAgeMs = 7 * 24 * 60 * 60 * 1000
const ratings = new Set<FlashcardReviewRating>(['again', 'hard', 'good', 'easy'])

type StoredFlashcardSessions = Record<string, unknown>

export type FlashcardReviewSessionSnapshot = {
  sessionId: string
  reviewIds: string[]
  index: number
  reviewEvents: FlashcardReviewEvent[]
  updatedAt: string
}

function readSessions(storage: StorageLike): StoredFlashcardSessions {
  try {
    const raw = storage.getItem(flashcardSessionsKey)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as StoredFlashcardSessions
      : {}
  } catch {
    return {}
  }
}

function sessionKey(sessionId: string) {
  return encodeURIComponent(sessionId)
}

export function saveFlashcardReviewSession(storage: StorageLike, snapshot: FlashcardReviewSessionSnapshot) {
  const sessions = readSessions(storage)
  sessions[sessionKey(snapshot.sessionId)] = snapshot
  try {
    storage.setItem(flashcardSessionsKey, JSON.stringify(sessions))
    return true
  } catch {
    return false
  }
}

export function clearFlashcardReviewSession(storage: StorageLike, sessionId: string) {
  const sessions = readSessions(storage)
  delete sessions[sessionKey(sessionId)]

  try {
    if (Object.keys(sessions).length === 0) {
      storage.removeItem(flashcardSessionsKey)
      return true
    }
    storage.setItem(flashcardSessionsKey, JSON.stringify(sessions))
    return true
  } catch {
    return false
  }
}

export function loadFlashcardReviewSession(
  storage: StorageLike,
  sessionId: string,
  cards: Flashcard[],
  now = new Date(),
): FlashcardReviewSessionSnapshot | null {
  const candidate = readSessions(storage)[sessionKey(sessionId)]
  if (!isValidSnapshot(candidate, sessionId, cards, now)) {
    if (candidate !== undefined) clearFlashcardReviewSession(storage, sessionId)
    return null
  }
  return candidate
}

function isValidSnapshot(
  value: unknown,
  sessionId: string,
  cards: Flashcard[],
  now: Date,
): value is FlashcardReviewSessionSnapshot {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const snapshot = value as Partial<FlashcardReviewSessionSnapshot>
  if (snapshot.sessionId !== sessionId) return false
  if (!Array.isArray(snapshot.reviewIds) || snapshot.reviewIds.length === 0) return false
  if (!snapshot.reviewIds.every((id): id is string => typeof id === 'string')) return false
  if (new Set(snapshot.reviewIds).size !== snapshot.reviewIds.length) return false

  const catalogIds = new Set(cards.map((card) => card.id))
  if (!snapshot.reviewIds.every((id) => catalogIds.has(id))) return false
  if (!Number.isInteger(snapshot.index) || snapshot.index! <= 0 || snapshot.index! >= snapshot.reviewIds.length) return false
  if (!Array.isArray(snapshot.reviewEvents) || snapshot.reviewEvents.length !== snapshot.index) return false

  for (let index = 0; index < snapshot.reviewEvents.length; index += 1) {
    const event = snapshot.reviewEvents[index] as Partial<FlashcardReviewEvent> | undefined
    if (!event || event.flashcardId !== snapshot.reviewIds[index]) return false
    if (typeof event.rating !== 'string' || !ratings.has(event.rating as FlashcardReviewRating)) return false
    if (!isValidIsoDate(event.reviewedAt, now)) return false
    if (event.nextReview !== undefined && !isValidIsoDate(event.nextReview, now, false)) return false
  }

  if (!isValidIsoDate(snapshot.updatedAt, now)) return false
  const updatedAt = Date.parse(snapshot.updatedAt!)
  if (now.getTime() - updatedAt > maxSessionAgeMs) return false
  return true
}

function isValidIsoDate(value: unknown, now: Date, rejectFuture = true) {
  if (typeof value !== 'string') return false
  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed)) return false
  return !rejectFuture || parsed <= now.getTime() + 5 * 60 * 1000
}
