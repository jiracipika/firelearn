import { Award, Flame, Medal, Target, Trophy } from 'lucide-react'
import { achievementProgress as seedAchievements, leaderboardEntries as seedEntries, weeklyChallenges as seedChallenges } from '@/data/gamification'
import type { AchievementProgress, LeaderboardEntry, WeeklyChallenge } from '@/services/gamification'
import { buildLeaderboard, getActiveChallenges, getLearnerRank, summarizeAchievements } from '@/services/gamification'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Reveal, Stagger } from '@/components/ui/motion'
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
      {learnerRank && (
        <span
          className={cn(
            'rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300',
            learnerRank <= 3 && 'animate-rank-pulse',
          )}
        >
          #{learnerRank}
        </span>
      )}
    </div>
    <Stagger className="space-y-1.5" stagger={0.05}>
      {displayEntries.map((entry) => {
        const isYou = entry.id === 'current-learner'
        const isPodium = entry.rank <= 3
        return (
          <Reveal
            key={entry.id}
            as="div"
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200',
              isYou ? 'border-primary/30 bg-primary/8' : 'border-border bg-elevated/40 hover:border-border-bright',
            )}
          >
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-lg text-xs font-bold transition-transform duration-200',
                entry.rank === 1 && 'bg-amber-400/20 text-amber-300',
                entry.rank === 2 && 'bg-slate-400/20 text-slate-300',
                entry.rank === 3 && 'bg-orange-600/20 text-orange-400',
                entry.rank > 3 && 'bg-elevated text-muted',
                isPodium && 'animate-pop-in',
              )}
            >
              {entry.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{entry.name}</p>
              <p className="truncate text-xs text-muted">{entry.company} · {entry.completedLessons} lessons</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold tabular-nums text-white">{entry.xp.toLocaleString()}</p>
              <p className="flex items-center justify-end gap-0.5 text-xs text-muted"><Flame size={10} /> {entry.streakDays}d</p>
            </div>
          </Reveal>
        )
      })}
    </Stagger>
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
    <Stagger className="grid gap-2.5" stagger={0.06}>
      {active.map((challenge) => {
        const percent = Math.round((challenge.progress / challenge.goal) * 100)
        const complete = percent >= 100
        return (
          <Reveal
            key={challenge.id}
            as="div"
            className={cn(
              'rounded-xl border p-3.5 transition-colors duration-200',
              complete ? 'border-success/30 bg-success/5' : 'border-border bg-elevated/40',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">{challenge.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{challenge.description}</p>
              </div>
              <span className={cn(
                'shrink-0 rounded-md px-2 py-0.5 text-xs font-bold transition-transform duration-200',
                complete ? 'bg-success/15 text-success animate-pop-in' : 'bg-primary/10 text-red-300',
              )}>
                +{challenge.xpReward}
              </span>
            </div>
            <Progress className="mt-3 h-1.5" value={percent} />
            <p className="mt-1.5 text-xs tabular-nums text-muted">{challenge.progress}/{challenge.goal}</p>
          </Reveal>
        )
      })}
    </Stagger>
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
    <Stagger className="grid gap-2.5" stagger={0.07}>
      {source.map((achievement) => {
        const summary = summaries.find((item) => item.id === achievement.id)
        const percent = summary?.percent ?? 0
        const unlocked = achievement.unlocked || percent >= 100
        return (
          <Reveal
            key={achievement.id}
            as="div"
            className={cn(
              'rounded-xl border p-3.5 transition-colors duration-200',
              unlocked ? 'border-amber-400/20 bg-amber-400/5' : 'border-border bg-elevated/40',
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'relative inline-flex size-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                  unlocked
                    ? 'border-amber-400/40 bg-amber-400/15 animate-achievement-glow'
                    : 'border-border bg-elevated/60 grayscale',
                )}
              >
                <Medal
                  className={cn('transition-colors duration-300', unlocked ? 'text-amber-400' : 'text-muted/50')}
                  size={18}
                />
                {unlocked && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-amber-400/20 blur-md"
                    style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
                  />
                )}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn('text-sm font-semibold transition-colors duration-200', unlocked ? 'text-white' : 'text-white/90')}>
                    {achievement.title}
                  </p>
                  <span className="text-xs font-medium tabular-nums text-muted">{percent}%</span>
                </div>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{achievement.description}</p>
                <Progress className="mt-2.5 h-1.5" value={percent} />
                {unlocked && (
                  <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                    <Award size={11} /> Unlocked
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        )
      })}
    </Stagger>
  </Card>
}
