import { Card } from '@/components/ui/card'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function StudyHeatmap({ weeklyActivity }: { weeklyActivity: number[] }) {
  const max = Math.max(1, ...weeklyActivity)
  return <Card className="space-y-4">
    <div>
      <h2 className="font-bold text-white">Weekly activity</h2>
      <p className="mt-1 text-sm text-muted-foreground">Minutes studied over the last seven days.</p>
    </div>
    <div className="flex items-end justify-between gap-2">
      {weeklyActivity.map((minutes, index) => {
        const intensity = minutes / max
        return <div key={index} className="group flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full items-end justify-center" style={{ height: '100px' }}>
            <div
              className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-primary/30 to-primary/90 transition-all duration-300 group-hover:from-primary/50 group-hover:to-accent/90"
              style={{ height: `${Math.max(8, intensity * 100)}px`, filter: intensity > 0.6 ? 'drop-shadow(0 0 6px rgb(255 74 46 / 0.4))' : undefined }}
              aria-label={`${minutes} minutes`}
            />
          </div>
          <div className="text-center transition-colors group-hover:text-white">
            <p className="text-xs font-medium text-white">{minutes}m</p>
            <p className="text-[10px] text-muted">{days[index]}</p>
          </div>
        </div>
      })}
    </div>
  </Card>
}
