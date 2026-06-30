'use client'

import * as React from 'react'
import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { useStudyActivity } from '@/hooks/use-study-activity'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

export function StudyTimerPanel() {
  const [seconds, setSeconds] = React.useState(0)
  const [running, setRunning] = React.useState(false)
  const { record } = useStudyActivity()

  React.useEffect(() => {
    if (!running) return
    const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(interval)
  }, [running])

  function saveSession() {
    const minutes = Math.max(1, Math.round(seconds / 60))
    record({ kind: 'study_timer', minutes })
    setSeconds(0)
    setRunning(false)
  }

  return <Card className="space-y-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 font-bold text-white"><Timer size={18} className="text-red-400" /> Study timer</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Track real minutes for streaks and weekly activity.</p>
      </div>
      <span className="font-mono text-3xl font-bold text-white">{formatSeconds(seconds)}</span>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={() => setRunning((value) => !value)}>
        {running ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
      </Button>
      <Button size="sm" variant="outline" disabled={seconds === 0} onClick={saveSession}>Save session</Button>
      <Button size="sm" variant="ghost" disabled={seconds === 0} onClick={() => { setSeconds(0); setRunning(false) }}><RotateCcw size={16} /> Reset</Button>
    </div>
  </Card>
}
