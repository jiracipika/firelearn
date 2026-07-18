'use client'

import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Reload button for the offline page. The offline page itself is a Server
 * Component (so it precaches cleanly with no client data fetches); this tiny
 * client island owns the only interactive piece — a hard reload to retry the
 * network once the user thinks connectivity is back.
 */
export function ReloadButton() {
  return (
    <Button onClick={() => window.location.reload()}>
      <RotateCcw size={16} /> Try reloading
    </Button>
  )
}
