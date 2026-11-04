'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

/**
 * Scroll-driven multi-axis drift for the fireground scene: it floats
 * against the scroll direction, banks slightly, and dissolves through a
 * heat-haze hue-shift + progressive blur toward the edges of the viewport.
 */
export function SceneParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [64, -64])
  const rotate = useTransform(scrollYProgress, [0, 1], [-2.2, 2.2])
  const filter = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ['hue-rotate(0deg) blur(0px)', 'hue-rotate(8deg) blur(0px)', 'hue-rotate(26deg) blur(2.5px)'],
  )

  if (reduce) return <div ref={ref}>{children}</div>

  return (
    <motion.div ref={ref} style={{ y, rotate, filter }}>
      {children}
    </motion.div>
  )
}
