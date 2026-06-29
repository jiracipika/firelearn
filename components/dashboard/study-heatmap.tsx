import { learnerProgress } from '@/data/progress'
import { Card } from '@/components/ui/card'

export function StudyHeatmap() {
  const max = Math.max(...learnerProgress.weeklyActivity)
  return <Card className="space-y-4"><div><h2 className="font-semibold">Weekly activity</h2><p className="mt-1 text-sm text-muted">Minutes studied over the last seven days.</p></div><div className="grid grid-cols-7 gap-2">{learnerProgress.weeklyActivity.map((minutes, index) => <div key={`${minutes}-${index}`} className="space-y-2 text-center"><div className="rounded-xl bg-primary/20" style={{ height: `${Math.max(24, (minutes / max) * 96)}px` }} aria-label={`${minutes} minutes studied`} /><p className="text-xs text-muted">{minutes}m</p></div>)}</div></Card>
}
