'use client'

import { useEffect, useRef } from 'react'

type Ember = { x: number; y: number; r: number; hue: number; speed: number; sway: number; phase: number; flicker: number }
type Wisp = { x: number; y: number; r: number; speed: number; drift: number; alpha: number }

const EMBER_HUES = ['255, 117, 67', '255, 176, 63', '255, 225, 140'] as const

/**
 * Ambient ember field for the landing hero: rising embers with flicker,
 * plus a few slow smoke wisps, drawn over a transparent canvas so the
 * hero's own gradient stays the base layer. Decorative only; disabled
 * under prefers-reduced-motion and paused while off-screen.
 */
export function EmberField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let dpr = 1
    let frameId = 0
    let visible = true
    let embers: Ember[] = []
    let wisps: Wisp[] = []

    const seed = () => {
      const emberCount = Math.min(44, Math.round((w * h) / 26000))
      embers = Array.from({ length: emberCount }, () => ({
        x: Math.random() * w,
        y: h * (0.25 + Math.random() * 0.78),
        r: 0.9 + Math.random() * 2.1,
        hue: Math.floor(Math.random() * EMBER_HUES.length),
        speed: 0.25 + Math.random() * 0.75,
        sway: 10 + Math.random() * 34,
        phase: Math.random() * Math.PI * 2,
        flicker: 0.5 + Math.random() * 1.6,
      }))
      wisps = Array.from({ length: 5 }, () => ({
        x: Math.random() * w,
        y: h * (0.35 + Math.random() * 0.7),
        r: 90 + Math.random() * 150,
        speed: 0.06 + Math.random() * 0.12,
        drift: (Math.random() - 0.5) * 0.3,
        alpha: 0.028 + Math.random() * 0.03,
      }))
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(canvas)

    const draw = (t: number) => {
      frameId = requestAnimationFrame(draw)
      if (!visible) return
      const time = t / 1000

      ctx.clearRect(0, 0, w, h)

      // Smoke wisps — slow, large, barely-there heat haze.
      for (const s of wisps) {
        s.y -= s.speed
        s.x += s.drift
        if (s.y < -s.r) {
          s.y = h + s.r * 0.6
          s.x = Math.random() * w
        }
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r)
        grad.addColorStop(0, `rgba(255, 154, 128, ${s.alpha})`)
        grad.addColorStop(1, 'rgba(255, 154, 128, 0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Embers — rising, swaying, flickering.
      for (const e of embers) {
        e.y -= e.speed
        if (e.y < -8) {
          e.y = h + 8
          e.x = Math.random() * w
        }
        const x = e.x + Math.sin(time * 0.7 + e.phase) * e.sway * 0.45
        const alpha = 0.35 + 0.4 * Math.abs(Math.sin(time * e.flicker + e.phase))
        ctx.beginPath()
        ctx.arc(x, e.y, e.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${EMBER_HUES[e.hue]}, ${alpha.toFixed(3)})`
        ctx.shadowColor = `rgba(${EMBER_HUES[e.hue]}, 0.85)`
        ctx.shadowBlur = 9
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }
    frameId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frameId)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
