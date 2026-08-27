'use client'

import * as React from 'react'
import { animate, useReducedMotion } from 'framer-motion'

/**
 * Smoothly counts from the previous value to the next value using a spring-like
 * easing curve. Used for XP totals, streaks, scores, and any metric that should
 * "tick up" rather than snap.
 *
 * Renders a <span> by default. Pass `className` to control sizing/weight/color.
 * The displayed value respects `locale` (default en-US) and the number of
 * decimal places.
 */
export function AnimatedNumber({
  value,
  className,
  duration = 0.9,
  decimals = 0,
  locale = 'en-US',
  prefix = '',
  suffix = '',
  format = true,
}: {
  value: number
  className?: string
  /** Animation length in seconds. */
  duration?: number
  /** How many decimal places to render. */
  decimals?: number
  /** Locale used by Intl.NumberFormat when `format` is true. */
  locale?: string
  prefix?: string
  suffix?: string
  /** When false, renders the raw number without grouping separators. */
  format?: boolean
}) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = React.useState(value)
  const previousValue = React.useRef(value)
  const nodeRef = React.useRef<HTMLSpanElement | null>(null)

  React.useEffect(() => {
    if (reduce) {
      // Defer the state write off the effect's synchronous path so reduced-
      // motion users get a direct snap to the final value without cascading
      // renders during commit (react-hooks/set-state-in-effect).
      let cancelled = false
      queueMicrotask(() => {
        if (!cancelled) {
          setDisplay(value)
          previousValue.current = value
        }
      })
      return () => {
        cancelled = true
      }
    }
    const from = previousValue.current
    if (from === value) return

    const controls = animate(from, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(latest),
    })

    previousValue.current = value
    return () => controls.stop()
  }, [value, duration, reduce])

  const formatted = React.useMemo(() => {
    if (!format) return display.toFixed(decimals)
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(display)
  }, [display, decimals, format, locale])

  return (
    <span ref={nodeRef} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
