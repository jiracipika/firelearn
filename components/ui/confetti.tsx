'use client'

import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Confetti burst — fires a one-shot shower of colorful particles when `fire`
 * transitions to a new truthy value. Used by achievement unlocks, perfect
 * scores, and the flashcard completion screen to add a small celebratory beat
 * without pulling in a heavy dependency.
 *
 * The burst is purely decorative (aria-hidden) and disabled when the user
 * prefers reduced motion.
 */

const PARTICLE_COLORS = ['#ff4a2e', '#ffc857', '#42d392', '#55c7f7', '#ffffff']

type Particle = {
  id: number
  x: number
  y: number
  rotate: number
  scale: number
  color: string
  delay: number
  duration: number
}

function buildParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count + (Math.random() - 0.5) * 0.6
    const distance = 60 + Math.random() * 90
    return {
      id: index,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 30,
      rotate: (Math.random() - 0.5) * 540,
      scale: 0.6 + Math.random() * 0.8,
      color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
      delay: Math.random() * 0.08,
      duration: 0.7 + Math.random() * 0.5,
    }
  })
}

export function ConfettiBurst({
  fire,
  className,
  particleCount = 18,
}: {
  /** Any truthy value; the burst re-fires when the value changes. */
  fire: unknown
  className?: string
  particleCount?: number
}) {
  const reduce = useReducedMotion()
  const [particles, setParticles] = React.useState<Particle[]>([])
  const [burstId, setBurstId] = React.useState(0)
  const lastFire = React.useRef<unknown>(fire)

  React.useEffect(() => {
    if (reduce) return
    if (!fire) return
    if (lastFire.current === fire) return
    lastFire.current = fire
    setParticles(buildParticles(particleCount))
    setBurstId((id) => id + 1)
  }, [fire, particleCount, reduce])

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-visible', className)}
    >
      <AnimatePresence>
        {!reduce && particles.length > 0 && (
          <motion.div
            key={burstId}
            className="absolute left-1/2 top-1/2"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            onAnimationComplete={() => setParticles([])}
          >
            {particles.map((particle) => (
              <motion.span
                key={particle.id}
                className="absolute block size-2 rounded-[2px]"
                style={{ backgroundColor: particle.color }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: particle.scale }}
                animate={{
                  x: particle.x,
                  y: particle.y,
                  opacity: 0,
                  rotate: particle.rotate,
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
