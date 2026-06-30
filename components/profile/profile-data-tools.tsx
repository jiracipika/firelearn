'use client'

import { Download, Trash2 } from 'lucide-react'
import { getBrowserStorage } from '@/services/local-persistence'
import { exportLocalFireLearnData } from '@/services/study-activity'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const localKeys = [
  'firelearn.learnerState.v1',
  'firelearn.quizHistory.v1',
  'firelearn.flashcards.v1',
  'firelearn.syncQueue.v1',
  'firelearn.studyActivity.v1',
]

export function ProfileDataTools({ onReset }: { onReset?: () => void }) {
  function downloadExport() {
    const storage = getBrowserStorage()
    if (!storage) return
    const blob = new Blob([JSON.stringify(exportLocalFireLearnData(storage), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `firelearn-export-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function resetLocalData() {
    if (!window.confirm('Clear local FireLearn progress, quiz history, flashcards, sync queue, and study activity on this device? Supabase data is not deleted.')) return
    const storage = getBrowserStorage()
    if (!storage) return
    localKeys.forEach((key) => storage.removeItem(key))
    onReset?.()
  }

  return <Card className="space-y-4">
    <div>
      <h2 className="font-bold text-white">Data tools</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">Export your on-device FireLearn data or clear this device. Cloud Supabase records are unaffected by local reset.</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={downloadExport}><Download size={16} /> Export JSON</Button>
      <Button variant="danger" size="sm" onClick={resetLocalData}><Trash2 size={16} /> Reset local data</Button>
    </div>
  </Card>
}
