import { Award, Flame, Medal, Target, Trophy } from 'lucide-react'
import { achievementProgress as seedAchievements, leaderboardEntries as seedEntries, weeklyChallenges as seedChallenges } from '@/data/gamification'
import type { AchievementProgress, LeaderboardEntry, WeeklyChallenge } from '@/services/gamification'
import { buildLeaderboard, getActiveChallenges, getLearnerRank, summarizeAchievements } from '@/services/gamification'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export function LeaderboardPanel({ compact = false, learnerEntry }: { compact?: boolean; learnerEntry?: LeaderboardEntry }) {
  const entries = learnerEntry ? seedEntries.map((entry) => (entry.id === 'current-learner' ? learnerEntry : entry)) : seedEntries
  const ranked = buildLeaderboard(entries)
  const learnerRank = getLearnerRank(entries, 'current-learner')
  const displayEntries = compact ? ranked.slice(0, 5) : ranked

  return <Card className="space-y-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 font-bold text-white"><Trophy size={18} className="text-amber-400" /> Leaderboard</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Weekly XP race</p>
      </div>
      {learnerRank && <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">#{learnerRank}</span>}
    </div>
    <div className="space-y-1.5">
      {displayEntries.map((entry) => (
        <div key={entry.id} className={cn('flex items-center gap-3 rounded-xl border px-3 py-2.5', entry.id === 'current-learner' ? 'border-primary/30 bg-primary/8' : 'border-border bg-elevated/40')}>
          <span className={cn('flex size-8 items-center justify-center rounded-lg text-xs font-bold', entry.rank === 1 ? 'bg-amber-400/20 text-amber-300' : entry.rank === 2 ? 'bg-slate-400/20 text-slate-300' : entry.rank === 3 ? 'bg-orange-600/20 text-orange-400' : 'bg-elevated text-muted')}>{entry.rank}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{entry.name}</p>
            <p className="truncate text-xs text-muted">{entry.company} · {entry.completedLessons} lessons</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-white">{entry.xp.toLocaleString()}</p>
            <p className="flex items-center justify-end gap-0.5 text-xs text-muted"><Flame size={10} /> {entry.streakDays}d</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
}

export function WeeklyChallengesPanel({ challenges }: { challenges?: WeeklyChallenge[] }) {
  const source = challenges ?? seedChallenges
  const active = getActiveChallenges(source)
  return <Card className="space-y-4">
    <div>
      <h2 className="flex items-center gap-2 font-bold text-white"><Target size={18} className="text-red-400" /> Weekly challenges</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Focused reps for XP rewards</p>
    </div>
    <div className="grid gap-2.5">
      {active.map((challenge) => (
        <div key={challenge.id} className="rounded-xl border border-border bg-elevated/40 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-white">{challenge.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{challenge.description}</p>
            </div>
            <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-red-300">+{challenge.xpReward}</span>
          </div>
          <Progress className="mt-3 h-1.5" value={Math.round((challenge.progress / challenge.goal) * 100)} />
          <p className="mt-1.5 text-xs text-muted">{challenge.progress}/{challenge.goal}</p>
        </div>
      ))}
    </div>
  </Card>
}

export function AchievementProgressPanel({ achievements }: { achievements?: AchievementProgress[] }) {
  const source = achievements ?? seedAchievements
  const summaries = summarizeAchievements(source)
  return <Card className="space-y-4">
    <div>
      <h2 className="flex items-center gap-2 font-bold text-white"><Award size={18} className="text-amber-400" /> Achievement path</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Badges and milestones</p>
    </div>
    <div className="grid gap-2.5">
      {source.map((achievement) => {
        const summary = summaries.find((item) => item.id === achievement.id)
        return <div key={achievement.id} className="rounded-xl border border-border bg-elevated/40 p-3.5">
          <div className="flex items-start gap-3">
            <Medal className={cn('shrink-0', achievement.unlocked ? 'text-amber-400' : 'text-muted/50')} size={18} />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{achievement.title}</p>
                <span className="text-xs font-medium text-muted">{summary?.percent ?? 0}%</span>
              </div>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{achievement.description}</p>
              <Progress className="mt-2.5 h-1.5" value={summary?.percent ?? 0} />
            </div>
          </div>
        </div>
      })}
    </div>
  </Card>
}
