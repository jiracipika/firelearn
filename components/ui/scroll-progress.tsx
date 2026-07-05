'use client'

import { motion, useScroll, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * A thin gradient bar pinned to the top of the viewport that fills in lockstep
 * with how far the learner has scrolled through the current page. Used on long
 * reading surfaces (lesson articles) to give a sense of progress without a
 * fixed percentage bar.
 *
 * Uses framer-motion's useScroll (window scroll) + a spring so the indicator
 * tracks smoothly rather than jittering on every scroll event.
 */
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className={cn(
        'fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-primary via-red-400 to-accent',
        className,
      )}
    />
  )
}
