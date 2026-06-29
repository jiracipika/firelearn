import { Activity, Flame, Trophy, UserCircle } from 'lucide-react'
import { learnerProgress } from '@/data/progress'
import { AchievementProgressPanel, LeaderboardPanel, WeeklyChallengesPanel } from '@/components/dashboard/gamification-panels'
import { AppShell } from '@/components/layout/app-shell'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default function ProfilePage() {
  const levelProgress = Math.round((learnerProgress.xp % 750) / 750 * 100)
  return <AppShell><div className="space-y-8">
    <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <Card className="space-y-5"><UserCircle className="text-red-200" size={42} /><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">Learner profile</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Engine 7 Firefighter</h1><p className="mt-2 text-muted">Anonymous Supabase learner profile. Future versions can map this to department accounts and certifications.</p></div></Card>
      <Card className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><Trophy className="text-amber-200" /><p className="mt-3 text-2xl font-semibold">Level {learnerProgress.level}</p><p className="text-sm text-muted">{learnerProgress.xp.toLocaleString()} XP</p><Progress className="mt-3" value={levelProgress} /></div><div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><Flame className="text-red-200" /><p className="mt-3 text-2xl font-semibold">{learnerProgress.streakDays} days</p><p className="text-sm text-muted">Current streak</p></div><div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><Activity className="text-green-200" /><p className="mt-3 text-2xl font-semibold">{learnerProgress.minutesStudiedToday}/{learnerProgress.dailyGoalMinutes}m</p><p className="text-sm text-muted">Daily goal</p></div></Card>
    </section>
    <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]"><LeaderboardPanel /><WeeklyChallengesPanel /></section>
    <AchievementProgressPanel />
  </div></AppShell>
}
