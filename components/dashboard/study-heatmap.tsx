import { learnerProgress } from '@/data/progress'
import { Card } from '@/components/ui/card'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function StudyHeatmap() {
  const max = Math.max(...learnerProgress.weeklyActivity)
  return <Card className="space-y-4">
    <div>
      <h2 className="font-bold text-white">Weekly activity</h2>
      <p className="mt-1 text-sm text-muted-foreground">Minutes studied over the last seven days.</p>
    </div>
    <div className="flex items-end justify-between gap-2">
      {learnerProgress.weeklyActivity.map((minutes, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full items-end justify-center" style={{ height: '100px' }}>
            <div
              className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-primary/40 to-primary/80 transition-all"
              style={{ height: `${Math.max(8, (minutes / max) * 100)}px` }}
              aria-label={`${minutes} minutes`}
            />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-white">{minutes}m</p>
            <p className="text-[10px] text-muted">{days[index]}</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
}
