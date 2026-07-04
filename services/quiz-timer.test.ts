import { describe, expect, it } from 'vitest'
import {
  computeTimerState,
  formatCountdown,
  hasVisibleCountdown,
  urgencyFor,
} from '@/services/quiz-timer'

describe('quiz timer', () => {
  it('reports a hidden timer when no time limit is set', () => {
    expect(hasVisibleCountdown(undefined)).toBe(false)
    expect(hasVisibleCountdown(0)).toBe(false)
    expect(hasVisibleCountdown(-5)).toBe(false)
    expect(hasVisibleCountdown(60)).toBe(true)
  })

  it('computes remaining seconds and clamps at zero', () => {
    expect(computeTimerState(60, 0)).toMatchObject({ seconds: 60, remaining: 60 })
    expect(computeTimerState(60, 15)).toMatchObject({ seconds: 45 })
    expect(computeTimerState(60, 59)).toMatchObject({ seconds: 1 })
    expect(computeTimerState(60, 60)).toMatchObject({ seconds: 0, urgency: 'expired' })
    // Over-shoot clamps at zero, never negative.
    expect(computeTimerState(60, 120)).toMatchObject({ seconds: 0, urgency: 'expired' })
  })

  it('treats negative elapsed as zero (SSR boundary safety)', () => {
    expect(computeTimerState(60, -5)).toMatchObject({ seconds: 60 })
  })

  it('classifies urgency by budget fraction with a 10s floor', () => {
    // 60s budget: 50% = 30s, 20% = 12s.
    // calm > 30s, steady 13-30s, urgent <= 12s (or <= 10s), expired 0.
    expect(urgencyFor(45, 60)).toBe('calm')
    expect(urgencyFor(20, 60)).toBe('steady')
    expect(urgencyFor(12, 60)).toBe('urgent')
    expect(urgencyFor(0, 60)).toBe('expired')

    // 40s budget: 50% = 20, 20% = 8. Steady = remaining in (10, 20].
    // The 10s floor means steady needs > 10s remaining.
    expect(urgencyFor(15, 40)).toBe('steady')
    expect(urgencyFor(8, 40)).toBe('urgent')
    expect(urgencyFor(0, 40)).toBe('expired')

    // 10s floor: any remaining <= 10s is urgent regardless of budget fraction.
    expect(urgencyFor(8, 10)).toBe('urgent')
    expect(urgencyFor(0, 10)).toBe('expired')
  })

  it('formats countdown as m:ss with zero-padding', () => {
    expect(formatCountdown(90)).toBe('1:30')
    expect(formatCountdown(60)).toBe('1:00')
    expect(formatCountdown(5)).toBe('0:05')
    expect(formatCountdown(0)).toBe('0:00')
    expect(formatCountdown(-3)).toBe('0:00') // never negative
  })

  it('computeTimerState and formatCountdown compose for the live badge', () => {
    const state = computeTimerState(75, 50) // 25s left on a 75s budget → steady
    expect(state.urgency).toBe('steady')
    expect(formatCountdown(state.seconds)).toBe('0:25')
  })
})
