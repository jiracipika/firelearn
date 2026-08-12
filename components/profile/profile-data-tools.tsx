'use client'

import * as React from 'react'
import { Download, Trash2, Upload } from 'lucide-react'
import { restoreExportedData } from '@/services/data-integrity'
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
  'firelearn.studyTimer.v1',
]

const maxImportBytes = 1_000_000

type ImportStatus = { tone: 'success' | 'error'; message: string } | null

export function ProfileDataTools({ onReset }: { onReset?: () => void }) {
  const importInputRef = React.useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = React.useState<ImportStatus>(null)

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

  async function importExport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (file.size > maxImportBytes) {
      setImportStatus({ tone: 'error', message: 'Import failed: the export must be smaller than 1 MB.' })
      return
    }

    const storage = getBrowserStorage()
    if (!storage) return

    try {
      const raw: unknown = JSON.parse(await file.text())
      if (!window.confirm('Restore progress from this export? Current on-device values in the file will be replaced. Supabase data is unaffected.')) return
      const result = restoreExportedData(storage, raw)
      setImportStatus({ tone: 'success', message: `Restored ${result.restoredKeys} local data ${result.restoredKeys === 1 ? 'section' : 'sections'}.` })
      onReset?.()
    } catch (error) {
      setImportStatus({
        tone: 'error',
        message: error instanceof SyntaxError
          ? 'Import failed: choose a valid FireLearn JSON export.'
          : error instanceof Error ? error.message : 'Import failed: the export could not be restored.',
      })
    }
  }

  function resetLocalData() {
    if (!window.confirm('Clear local FireLearn progress, quiz history, flashcards, sync queue, study activity, and timer on this device? Supabase data is not deleted.')) return
    const storage = getBrowserStorage()
    if (!storage) return
    localKeys.forEach((key) => storage.removeItem(key))
    setImportStatus(null)
    onReset?.()
  }

  return <Card className="space-y-4">
    <div>
      <h2 className="font-bold text-white">Data tools</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">Export, restore, or clear on-device FireLearn data. Cloud Supabase records are unaffected.</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={downloadExport}><Download size={16} /> Export JSON</Button>
      <Button variant="outline" size="sm" onClick={() => importInputRef.current?.click()}><Upload size={16} /> Restore JSON</Button>
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={importExport}
        aria-label="Choose a FireLearn JSON export to restore"
      />
      <Button variant="danger" size="sm" onClick={resetLocalData}><Trash2 size={16} /> Reset local data</Button>
    </div>
    <p
      role="status"
      aria-live="polite"
      className={importStatus?.tone === 'error' ? 'text-sm text-red-300' : 'text-sm text-emerald-300'}
    >
      {importStatus?.message ?? ''}
    </p>
  </Card>
}
