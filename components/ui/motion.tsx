'use client'

import * as React from 'react'
import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Staggered reveal container + item pair, tuned for card grids, stat tiles, and
 * list sections. Wrap children in <Reveal> items inside a <Stagger> parent.
 *
 * Respects prefers-reduced-motion: when reduced, items render in place without
 * any transform or fade — the motion library handles this internally, so we do
 * not need a separate branch.
 */

const defaultContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

const defaultItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

export function Stagger({
  children,
  className,
  stagger = 0.06,
  delay = 0.04,
  ...rest
}: {
  children: React.ReactNode
  className?: string
  /** Seconds between each child reveal. */
  stagger?: number
  /** Seconds before the first child reveals. */
  delay?: number
  as?: keyof Pick<typeof motion, 'div' | 'li' | 'span' | 'section' | 'article'>
} & Omit<HTMLMotionProps<'div'>, 'children' | 'variants'>) {
  const reduce = useReducedMotion()
  const variants = React.useMemo<Variants>(
    () => ({
      hidden: {},
      visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
    }),
    [stagger, delay],
  )

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function Reveal({
  children,
  className,
  as = 'div',
  ...rest
}: {
  children: React.ReactNode
  className?: string
  as?: keyof Pick<typeof motion, 'div' | 'li' | 'span' | 'section' | 'article'>
} & Omit<HTMLMotionProps<'div'>, 'children' | 'variants'>) {
  const reduce = useReducedMotion()
  if (reduce) {
    const Tag = as as 'div'
    return <Tag className={className}>{children}</Tag>
  }
  const MotionTag = motion[as as 'div'] ?? motion.div
  return (
    <MotionTag className={className} variants={defaultItemVariants} {...rest}>
      {children}
    </MotionTag>
  )
}

/**
 * Single-shot entrance reveal for hero blocks or standalone elements that are
 * not part of a stagger group. Animates on mount (no whileInView).
 */
export function RevealOnMount({
  children,
  className,
  delay = 0,
  y = 16,
  as = 'div',
  ...rest
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  as?: keyof Pick<typeof motion, 'div' | 'section' | 'article' | 'header'>
} & Omit<HTMLMotionProps<'div'>, 'children' | 'variants'>) {
  const reduce = useReducedMotion()
  if (reduce) {
    const Tag = as as 'div'
    return <Tag className={className}>{children}</Tag>
  }
  const MotionTag = motion[as as 'div'] ?? motion.div
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

export const motionItemVariants = defaultItemVariants
export const motionContainerVariants = defaultContainerVariants

export { motion }
