/**
 * Per-question countdown helpers used by the quiz engine.
 *
 * Pure functions so the timing logic stays fully testable without React.
 * The component layer runs a setInterval and feeds the elapsed seconds here.
 */

export type TimerUrgency = 'calm' | 'steady' | 'urgent' | 'expired'

export type QuizTimerState = {
  remaining: number
  urgency: TimerUrgency
  /** Whole seconds remaining, clamped to >= 0. */
  seconds: number
}

/**
 * Compute the live timer state from a question's time limit and the number
 * of seconds elapsed since the question appeared.
 *
 * `elapsed` is clamped at >= 0 and `timeLimitSeconds` must be > 0; otherwise
 * the caller should not render a timer (see `hasVisibleCountdown`).
 */
export function computeTimerState(timeLimitSeconds: number, elapsedSeconds: number): QuizTimerState {
  const remaining = Math.max(0, Math.round(timeLimitSeconds - Math.max(0, elapsedSeconds)))
  return {
    remaining,
    seconds: remaining,
    urgency: urgencyFor(remaining, timeLimitSeconds),
  }
}

export function hasVisibleCountdown(timeLimitSeconds?: number): timeLimitSeconds is number {
  return typeof timeLimitSeconds === 'number' && timeLimitSeconds > 0
}

/**
 * Map remaining seconds to an urgency band the component styles with:
 * - calm    : > 50% of the budget left
 * - steady  : 21-50% left
 * - urgent  : <= 20% left (or under 10s regardless)
 * - expired : 0s left
 */
export function urgencyFor(remainingSeconds: number, budgetSeconds: number): TimerUrgency {
  if (remainingSeconds <= 0) return 'expired'
  if (remainingSeconds <= 10 || remainingSeconds <= budgetSeconds * 0.2) return 'urgent'
  if (remainingSeconds <= budgetSeconds * 0.5) return 'steady'
  return 'calm'
}

/**
 * m:ss formatting matching the study-timer panel, so the countdown badge
 * reads consistently across the app.
 */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
