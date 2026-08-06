'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

/**
 * Route-level page transitions.
 *
 * Next.js wraps every route segment in a fresh instance of `template.tsx` on
 * navigation, so this is the idiomatic hook for a per-route enter/exit
 * animation. We key the AnimatePresence on the pathname so each navigation
 * unmounts the previous page with a quick fade/slide while the next page
 * fades in — giving the SPA-like continuity that the dashboard, quiz, and
 * course flows benefit from.
 *
 * The motion is intentionally light (120ms fade + 8px lift) so it never reads
 * as a delay on real navigation. Reduced-motion users get an instant swap.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()

  if (reduce) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
