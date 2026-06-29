import { Award, Flame, Medal, Target, Trophy } from 'lucide-react'
import { achievementProgress as seedAchievements, leaderboardEntries as seedEntries, weeklyChallenges as seedChallenges } from '@/data/gamification'
import type { AchievementProgress, LeaderboardEntry, WeeklyChallenge } from '@/services/gamification'
import { buildLeaderboard, getActiveChallenges, getLearnerRank, summarizeAchievements } from '@/services/gamification'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function LeaderboardPanel({ compact = false, learnerEntry }: { compact?: boolean; learnerEntry?: LeaderboardEntry }) {
  const entries = learnerEntry
    ? seedEntries.map((entry) => (entry.id === 'current-learner' ? learnerEntry : entry))
    : seedEntries
  const ranked = buildLeaderboard(entries)
  const learnerRank = getLearnerRank(entries, 'current-learner')
  const displayEntries = compact ? ranked.slice(0, 4) : ranked

  return <Card className="space-y-4">
    <div className="flex items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold"><Trophy className="text-amber-200" size={19} /> Leaderboard</h2><p className="mt-1 text-sm text-muted">Weekly XP race across your company.</p></div>{learnerRank && <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-amber-100">Your rank #{learnerRank}</span>}</div>
    <div className="space-y-2">{displayEntries.map((entry) => <div key={entry.id} className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border p-3 ${entry.id === 'current-learner' ? 'border-primary/35 bg-primary/10' : 'border-white/[0.08] bg-black/20'}`}><span className="flex size-9 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-semibold">{entry.rank}</span><div><p className="font-medium text-white">{entry.name}</p><p className="text-xs text-muted">{entry.company} · {entry.completedLessons} lessons · {entry.perfectQuizzes} perfect quizzes</p></div><div className="text-right"><p className="font-semibold text-white">{entry.xp.toLocaleString()}</p><p className="flex items-center justify-end gap-1 text-xs text-muted"><Flame size={12} /> {entry.streakDays}d</p></div></div>)}</div>
  </Card>
}

export function WeeklyChallengesPanel({ challenges }: { challenges?: WeeklyChallenge[] }) {
  const source = challenges ?? seedChallenges
  const active = getActiveChallenges(source)
  return <Card className="space-y-4"><div><h2 className="flex items-center gap-2 font-semibold"><Target className="text-red-200" size={19} /> Weekly challenges</h2><p className="mt-1 text-sm text-muted">Focused reps that reward consistency.</p></div><div className="grid gap-3">{active.map((challenge) => <div key={challenge.id} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-white">{challenge.title}</p><p className="mt-1 text-sm leading-6 text-muted">{challenge.description}</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-red-100">+{challenge.xpReward} XP</span></div><Progress className="mt-4" value={Math.round((challenge.progress / challenge.goal) * 100)} /><p className="mt-2 text-xs text-muted">{challenge.progress}/{challenge.goal} complete</p></div>)}</div></Card>
}

export function AchievementProgressPanel({ achievements }: { achievements?: AchievementProgress[] }) {
  const source = achievements ?? seedAchievements
  const summaries = summarizeAchievements(source)
  return <Card className="space-y-4"><div><h2 className="flex items-center gap-2 font-semibold"><Award className="text-amber-200" size={19} /> Achievement path</h2><p className="mt-1 text-sm text-muted">Badges, medals, and certificates in progress.</p></div><div className="grid gap-3">{source.map((achievement) => { const summary = summaries.find((item) => item.id === achievement.id); return <div key={achievement.id} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><div className="flex items-start gap-3"><Medal className={achievement.unlocked ? 'text-amber-200' : 'text-muted'} size={20} /><div className="flex-1"><div className="flex items-center justify-between gap-3"><p className="font-medium text-white">{achievement.title}</p><span className="text-xs text-muted">{summary?.percent ?? 0}%</span></div><p className="mt-1 text-sm leading-6 text-muted">{achievement.description}</p><Progress className="mt-3" value={summary?.percent ?? 0} /></div></div></div> })}</div></Card>
}
