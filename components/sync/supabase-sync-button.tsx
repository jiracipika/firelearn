'use client'

import * as React from 'react'
import { UploadCloud } from 'lucide-react'
import { getBrowserStorage } from '@/services/local-persistence'
import { createOfflineProgressRepository } from '@/services/offline-progress'
import { createFireLearnBrowserSupabaseClient } from '@/services/supabase/client'
import { replaySyncQueueToSupabase } from '@/services/supabase/sync'
import { Button } from '@/components/ui/button'

export function SupabaseSyncButton({ onSynced }: { onSynced?: () => void }) {
  const [status, setStatus] = React.useState<'idle' | 'syncing' | 'done' | 'blocked' | 'error'>('idle')

  async function syncNow() {
    const storage = getBrowserStorage()
    const supabase = createFireLearnBrowserSupabaseClient()
    if (!storage || !supabase) {
      setStatus('blocked')
      return
    }

    setStatus('syncing')
    const repo = createOfflineProgressRepository(storage)
    const queue = repo.getSyncQueue()
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user.id
    if (!userId) {
      setStatus('blocked')
      return
    }

    const result = await replaySyncQueueToSupabase(supabase, queue, userId)
    if (result.syncedIds.length > 0) repo.clearSyncedQueueItems(result.syncedIds)
    setStatus(result.failed.length > 0 ? 'error' : 'done')
    onSynced?.()
  }

  const label = status === 'syncing' ? 'Syncing...' : status === 'done' ? 'Synced' : status === 'blocked' ? 'Sign in to sync' : status === 'error' ? 'Retry sync' : 'Sync to Supabase'

  return <Button variant="outline" onClick={syncNow} disabled={status === 'syncing'}><UploadCloud size={16} /> {label}</Button>
}
