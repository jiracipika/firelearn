'use client'

import * as React from 'react'
import Link from 'next/link'
import { CloudOff, ChevronRight } from 'lucide-react'

function subscribeToConnectivity(onStoreChange: () => void) {
  window.addEventListener('online', onStoreChange)
  window.addEventListener('offline', onStoreChange)

  return () => {
    window.removeEventListener('online', onStoreChange)
    window.removeEventListener('offline', onStoreChange)
  }
}

function getOnlineSnapshot() {
  return navigator.onLine
}

function getServerOnlineSnapshot() {
  return true
}

/**
 * Gives learners immediate, persistent feedback when writes are being queued
 * locally instead of synced to Supabase. useSyncExternalStore keeps the server
 * render stable while still reacting to browser connectivity changes.
 */
export function NetworkStatusBanner() {
  const online = React.useSyncExternalStore(
    subscribeToConnectivity,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  )

  if (online) return null

  return (
    <aside
      className="border-b border-amber-400/25 bg-amber-400/10 text-amber-50"
      aria-label="Connection status"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15">
          <CloudOff size={16} aria-hidden />
        </span>
        <p className="min-w-0 flex-1 text-sm leading-5">
          <strong className="font-semibold">Offline mode.</strong>{' '}
          <span className="text-amber-100/80">
            Progress saves on this device and will sync when your connection returns.
          </span>
        </p>
        <Link
          href="/offline"
          className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-amber-50 transition hover:bg-amber-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 sm:text-sm"
        >
          <span className="hidden sm:inline">Offline options</span>
          <span className="sm:hidden">Options</span>
          <ChevronRight size={15} aria-hidden />
        </Link>
      </div>
    </aside>
  )
}
