'use client'

import * as React from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'

const points = [
  { id: 'entry', label: 'Entry point', x: 28, y: 73, detail: 'Read the conditions before committing.' },
  { id: 'smoke', label: 'Smoke layer', x: 63, y: 28, detail: 'Observe velocity, density, colour, and volume.' },
  { id: 'roof', label: 'Roof line', x: 77, y: 49, detail: 'Watch for changes in the building profile.' },
] as const

export function FiregroundScene() {
  const [zoom, setZoom] = React.useState(1)
  const [active, setActive] = React.useState<(typeof points)[number]['id']>('smoke')
  const selected = points.find((point) => point.id === active)!

  return <div className="scene" aria-label="Interactive fireground study illustration">
    <div className="scene-topline"><span><i className="scene-live" /> FIELD VIEW / 001</span><span>INTERACTIVE STUDY FIELD</span></div>
    <div className="scene-viewport">
      <div className="scene-art" style={{ transform: `scale(${zoom})` }} aria-hidden="true">
        <div className="scene-halo" />
        <div className="scene-orbit scene-orbit-a" /><div className="scene-orbit scene-orbit-b" />
        <div className="scene-cross scene-cross-a">+</div><div className="scene-cross scene-cross-b">+</div>
        <svg className="scene-building" viewBox="0 0 700 520" fill="none" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="sceneWall" x1="220" x2="520" y1="230" y2="490" gradientUnits="userSpaceOnUse"><stop stopColor="#3b2520"/><stop offset="1" stopColor="#130f10"/></linearGradient>
            <linearGradient id="sceneFlame" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffe18c"/><stop offset=".45" stopColor="#fb7339"/><stop offset="1" stopColor="#bb321b" stopOpacity=".1"/></linearGradient>
            <filter id="sceneBlur"><feGaussianBlur stdDeviation="20"/></filter>
          </defs>
          <ellipse cx="376" cy="470" rx="292" ry="26" fill="#e9532b" opacity=".14" filter="url(#sceneBlur)"/>
          <path d="M102 470h507M150 445h400M180 418h355" stroke="#f78e59" strokeOpacity=".2" strokeWidth="1"/>
          <path d="M164 238l210-107 211 107v228H164V238Z" fill="url(#sceneWall)" stroke="#ff8a56" strokeOpacity=".7" strokeWidth="2"/>
          <path d="M131 248l243-124 242 124M164 240l210-108 211 108" stroke="#ffa06b" strokeWidth="4" strokeLinecap="round"/>
          <path d="M374 132v333M164 240h421M164 465h421" stroke="#fe9a66" strokeOpacity=".32" strokeWidth="1.4"/>
          <path d="M209 278h105v112H209V278Zm229 0h104v112H438V278Z" fill="#120e10" stroke="#f27845" strokeOpacity=".8" strokeWidth="2"/>
          <path d="M261 279v111M209 334h105m176-55v111m-52-56h104" stroke="#ff8a56" strokeOpacity=".56" strokeWidth="1.5"/>
          <path d="M336 465V327h78v138" fill="#130e0e" stroke="#ff9f68" strokeWidth="2"/>
          <path d="M470 366c-18-44 16-63-5-100 44 22 23 55 42 65 6-30 43-50 37-86 55 55 29 84 23 121H470Z" fill="url(#sceneFlame)" opacity=".86"/>
          <path d="M478 362c13-20-6-44 13-61-1 18 14 22 15 33 8-18 19-24 18-40 24 25 10 50 12 68h-58Z" fill="#ffd59a" opacity=".8"/>
          <path d="M261 290c-18-43 28-56 4-93 43 18 30 52 43 65 19-23 9-41 12-60 30 43 24 63 11 88" fill="url(#sceneFlame)" opacity=".5" filter="url(#sceneBlur)"/>
          <path d="M220 173c-15-19 4-33 20-34-11-17 6-32 27-27 8-35 55-31 68-4 30-19 62-5 64 21 31-15 58 3 50 23 33-7 50 7 47 25" stroke="#dd8e77" strokeOpacity=".52" strokeWidth="2" strokeDasharray="5 9"/>
          <path d="M247 138c-8-31 14-46 38-43m91 24c14-28 41-30 57-10m-110-29c-4-21 10-38 35-39" stroke="#f7a174" strokeOpacity=".22" strokeWidth="12" strokeLinecap="round" filter="url(#sceneBlur)"/>
          <path d="M123 467h487" stroke="#ffc493" strokeWidth="3"/>
        </svg>
        <div className="scene-sweep" />
      </div>
      {points.map((point) => <button key={point.id} type="button" className={`scene-hotspot ${active === point.id ? 'is-active' : ''}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} onClick={() => setActive(point.id)} aria-label={`Inspect ${point.label}`} aria-pressed={active === point.id}><span /></button>)}
      <div className="scene-coordinate">43° 39′ N&nbsp; / &nbsp;79° 23′ W</div>
      <div className="scene-scale">01 / 03 &nbsp;·&nbsp; FIELD NOTES</div>
    </div>
    <div className="scene-bottomline">
      <div className="scene-readout" aria-live="polite"><span>OBSERVATION {String(points.indexOf(selected) + 1).padStart(2, '0')}</span><strong>{selected.label}</strong><small>{selected.detail}</small></div>
      <div className="scene-controls" aria-label="Scene zoom controls">
        <button type="button" onClick={() => setZoom((value) => Math.max(1, +(value - .25).toFixed(2)))} disabled={zoom === 1} aria-label="Zoom out"><Minus size={15}/></button>
        <output aria-label="Zoom level">{Math.round(zoom * 100)}%</output>
        <button type="button" onClick={() => setZoom((value) => Math.min(1.75, +(value + .25).toFixed(2)))} disabled={zoom === 1.75} aria-label="Zoom in"><Plus size={15}/></button>
        <button type="button" onClick={() => { setZoom(1); setActive('smoke') }} aria-label="Reset scene"><RotateCcw size={14}/></button>
      </div>
    </div>
  </div>
}
