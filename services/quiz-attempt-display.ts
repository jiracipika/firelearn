import { QUIZ_PASS_THRESHOLD_PERCENT } from '@/services/quiz-history-summary'
import type { QuizAttempt } from '@/services/local-persistence'

/**
 * Display helpers for individual quiz attempts shown in history lists.
 *
 * The recorder stores `quizId` as the full quiz title used in the UI (for
 * example "Fireground Size-Up quiz · 12 questions"). That string is already
 * human-readable, so rather than re-deriving anything from lesson slugs we
 * just trim the trailing "· N questions" suffix for compact list rows and
 * classify the attempt outcome so the dashboard can colour-code each row.
 */

const QUESTION_COUNT_SUFFIX = /\s*[·]\s*\d+\s*questions?\s*$/i

export type QuizAttemptOutcome = 'passed' | 'failed' | 'perfect'

export type QuizAttemptDisplay = {
  /** Compact quiz title without the trailing "· N questions" suffix. */
  shortTitle: string
  /** True when this is the FireLearn mixed-practice bank (no single lesson). */
  isMixedPractice: boolean
  /** Relative time label ("Today", "Yesterday", "3 days ago", or a date). */
  whenLabel: string
  /** ISO date string (YYYY-MM-DD) for the title attribute / tooltips. */
  isoDate: string
  /** Outcome classification based on the configured pass threshold. */
  outcome: QuizAttemptOutcome
  /** Tailwind text colour token matching the outcome tone. */
  toneClass: string
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Derive the display fields for a single quiz attempt. Pure function over the
 * attempt and the current wall-clock time — testable without React.
 *
 * The `now` argument defaults to `new Date()` so callers in components do not
 * need to pass it. It is a `Date` rather than a number so test callers can use
 * `vi.setSystemTime(...)` without thinking about timezone math.
 */
export function describeQuizAttempt(attempt: QuizAttempt, now: Date = new Date()): QuizAttemptDisplay {
  const shortTitle = attempt.quizId.replace(QUESTION_COUNT_SUFFIX, '').trim()
  const isMixedPractice = /mixed practice/i.test(attempt.quizId)
  const completedAt = new Date(attempt.completedAt)

  const { whenLabel, isoDate } = formatWhen(completedAt, now)
  const outcome = classifyOutcome(attempt.scorePercent)
  const toneClass = toneForOutcome(outcome)

  return { shortTitle, isMixedPractice, whenLabel, isoDate, outcome, toneClass }
}

function classifyOutcome(scorePercent: number): QuizAttemptOutcome {
  if (scorePercent >= 100) return 'perfect'
  if (scorePercent >= QUIZ_PASS_THRESHOLD_PERCENT) return 'passed'
  return 'failed'
}

function toneForOutcome(outcome: QuizAttemptOutcome): string {
  switch (outcome) {
    case 'perfect':
      return 'text-amber-400'
    case 'passed':
      return 'text-success'
    case 'failed':
      return 'text-red-400'
  }
}

function formatWhen(completedAt: Date, now: Date): { whenLabel: string; isoDate: string } {
  const completedMs = completedAt.getTime()
  const nowMs = now.getTime()

  // Calendar-day diff is more user-friendly than a raw ms diff: an attempt
  // made at 23:55 and viewed at 00:05 is "Yesterday", not "Today".
  const startOfToday = startOfDay(nowMs)
  const startOfCompleted = startOfDay(completedMs)
  const calendarDaysApart = Math.round((startOfToday - startOfCompleted) / DAY_MS)

  let whenLabel: string
  if (calendarDaysApart <= 0) {
    whenLabel = 'Today'
  } else if (calendarDaysApart === 1) {
    whenLabel = 'Yesterday'
  } else if (calendarDaysApart < 7) {
    whenLabel = `${calendarDaysApart} days ago`
  } else if (calendarDaysApart < 14) {
    whenLabel = '1 week ago'
  } else {
    whenLabel = `${Math.floor(calendarDaysApart / 7)} weeks ago`
  }

  // ISO YYYY-MM-DD in the user's local timezone — for title/tooltip only, so a
  // slight format variation from UTC ISO is fine and matches what learners see
  // in their OS clock.
  const isoDate = `${completedAt.getFullYear()}-${String(completedAt.getMonth() + 1).padStart(2, '0')}-${String(completedAt.getDate()).padStart(2, '0')}`

  return { whenLabel, isoDate }
}

function startOfDay(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
