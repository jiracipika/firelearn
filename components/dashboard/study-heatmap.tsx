import { TrendingUp } from 'lucide-react'
import { learnerProgress } from '@/data/progress'
import type { StudyActivityDayLabel } from '@/hooks/use-study-activity'
import { Card } from '@/components/ui/card'
import { Reveal, Stagger } from '@/components/ui/motion'
import { cn } from '@/lib/utils'

// Fallback labels when no `dayLabels` prop is supplied. Matches the layout of
// `weeklyActivityDayLabels` (oldest-first, today last) but uses short, neutral
// day-ordinal labels so the heatmap still renders correctly before hydration
// without committing to a weekday that may not match the user's `now`.
const PLACEHOLDER_LABELS: StudyActivityDayLabel[] = Array.from({ length: 7 }, (_, index) => ({
  label: `D${index + 1}`,
  isToday: index === 6,
}))

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function StudyHeatmap({
  weeklyActivity,
  dayLabels,
}: {
  weeklyActivity: number[]
  dayLabels?: StudyActivityDayLabel[]
}) {
  const labels = dayLabels && dayLabels.length === 7 ? dayLabels : PLACEHOLDER_LABELS
  const max = Math.max(1, ...weeklyActivity)
  const total = weeklyActivity.reduce((sum, value) => sum + value, 0)
  const average = weeklyActivity.length === 0 ? 0 : total / weeklyActivity.length
  const activeDays = weeklyActivity.filter((value) => value > 0).length
  const bestDayIndex = weeklyActivity.reduce((best, value, index) => (value > weeklyActivity[best] ? index : best), 0)
  const goal = learnerProgress.dailyGoalMinutes
  const goalHitDays = weeklyActivity.filter((value) => value >= goal).length

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-white">
            <TrendingUp size={18} className="text-red-400" /> Weekly activity
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Minutes studied over the last seven days.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold text-white">{total}m</p>
          <p className="text-xs text-muted">total</p>
        </div>
      </div>

      <Stagger className="relative flex items-end justify-between gap-2" stagger={0.05} style={{ height: '116px' }}>
        {goal > 0 && max > 0 && (
          <div
            className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-success/40"
            style={{ bottom: `${clamp((goal / max) * 100, 4, 100)}%` }}
            aria-hidden
          >
            <span className="absolute -top-2 right-0 rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
              {goal}m goal
            </span>
          </div>
        )}
        {weeklyActivity.map((minutes, index) => {
          const intensity = minutes / max
          const hitGoal = minutes >= goal && goal > 0
          const day = labels[index]
          return (
            <Reveal key={index} as="div" className="group flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-end justify-center" style={{ height: '100px' }}>
                <div
                  className={cn(
                    'w-full max-w-10 rounded-t-lg bg-gradient-to-t transition-[height,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:to-accent/90',
                    hitGoal ? 'from-success/40 to-success/90' : 'from-primary/30 to-primary/90 group-hover:from-primary/50'
                  )}
                  style={{ height: `${Math.max(8, intensity * 100)}px`, filter: intensity > 0.6 ? 'drop-shadow(0 0 6px rgb(255 74 46 / 0.4))' : undefined }}
                  aria-label={`${minutes} minutes${day?.isToday ? ' (today)' : ''}`}
                />
              </div>
              <div className="text-center transition-colors group-hover:text-white">
                <p className={cn('text-xs font-medium tabular-nums', hitGoal ? 'text-success' : 'text-white')}>{minutes}m</p>
                <p className={cn('text-[10px] uppercase', day?.isToday ? 'font-bold text-primary' : 'text-muted')}>{day?.label}</p>
              </div>
            </Reveal>
          )
        })}
      </Stagger>

      <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
        <div>
          <p className="text-lg font-bold text-white">{Math.round(average)}m</p>
          <p className="text-[11px] text-muted">daily avg</p>
        </div>
        <div>
          <p className="text-lg font-bold text-white">{activeDays}/7</p>
          <p className="text-[11px] text-muted">active days</p>
        </div>
        <div>
          <p className="text-lg font-bold text-success">{goalHitDays}</p>
          <p className="text-[11px] text-muted">goal hits</p>
        </div>
      </div>

      {total > 0 && (
        <p className="text-xs text-muted-foreground">
          Best day: <span className="font-semibold text-white">{labels[bestDayIndex]?.label}</span> ({weeklyActivity[bestDayIndex]}m)
        </p>
      )}
    </Card>
  )
}
