'use client'

import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from 'framer-motion'

/**
 * Lenis buttery wheel smoothing, scoped to the landing page. Skipped
 * entirely under prefers-reduced-motion; native scrolling everywhere else.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true })
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [reduce])

  return <>{children}</>
}
