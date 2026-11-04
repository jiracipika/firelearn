'use client'

import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

/**
 * Count-up number for the metrics band. Server-renders the final value
 * (no-JS safe), then recounts from zero the first time it scrolls into
 * view. Under reduced motion the static value simply stays.
 */
export function CountUp({ value, pad }: { value: number; pad?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  // Keep formatting internal: props from Server Components must stay serializable.
  const formatValue = (v: number) => (pad ? String(v).padStart(pad, '0') : String(v))

  useEffect(() => {
    const el = ref.current
    if (!el || !inView || reduce) return
    el.textContent = formatValue(0)
    const controls = animate(0, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        el.textContent = formatValue(Math.round(latest))
      },
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduce])

  return <span ref={ref}>{formatValue(value)}</span>
}
