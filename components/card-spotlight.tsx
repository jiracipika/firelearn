'use client'

import type { PointerEvent, ReactNode } from 'react'

/**
 * Delegated cursor spotlight: listens once on a wrapper and publishes
 * --mx/--my on the hovered .fl-mode-card / .fl-course-card so CSS can
 * draw a per-card radial glow without any React re-render.
 */
export function CardSpotlight({ className, children }: { className?: string; children: ReactNode }) {
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const card = (event.target as HTMLElement).closest<HTMLElement>('.fl-mode-card, .fl-course-card')
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(2)}%`)
    card.style.setProperty('--my', `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(2)}%`)
  }

  return (
    <div className={className} onPointerMove={onMove}>
      {children}
    </div>
  )
}
