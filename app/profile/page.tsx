'use client'

import { Activity, Flame, LogOut, Trophy, UserCircle } from 'lucide-react'
import { learnerProgress } from '@/data/progress'
import { academyCourses } from '@/data/academy'
import { useSupabaseProgress } from '@/hooks/use-supabase-progress'
import { useOfflineProgress } from '@/hooks/use-offline-progress'
import { useStudyActivity } from '@/hooks/use-study-activity'
import { aggregateLearnerStats } from '@/services/gamification-aggregator'
import { buildCompletedLessonAwards } from '@/services/lesson-xp'
import { mergeCompletedLessonIds, mergeQuizHistory } from '@/services/progress-merge'
import type { LeaderboardEntry } from '@/services/gamification'
import { createFireLearnBrowserSupabaseClient } from '@/services/supabase/client'
import { AchievementProgressPanel, LeaderboardPanel, WeeklyChallengesPanel } from '@/components/dashboard/gamification-panels'
import { AppShell } from '@/components/layout/app-shell'
import { ProfileDataTools } from '@/components/profile/profile-data-tools'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const supabaseProgress = useSupabaseProgress()
  const offlineProgress = useOfflineProgress()
  const { authenticated, refresh } = supabaseProgress
  const completedLessonIds = mergeCompletedLessonIds(supabaseProgress.completedLessonIds, offlineProgress.learnerState.completedLessonIds)
  const quizHistory = mergeQuizHistory(supabaseProgress.quizHistory, offlineProgress.quizHistory)
  const studyActivity = useStudyActivity()

  const stats = (() => {
    const completedLessons = buildCompletedLessonAwards(academyCourses, completedLessonIds)
    return aggregateLearnerStats({ completedLessons, quizAttempts: quizHistory, flashcardsReviewed: 0, streakDays: studyActivity.streakDays })
  })()

  const totalXp = learnerProgress.xp + stats.xp
  const displayLevel = Math.floor(totalXp / 750) + 1
  const levelProgress = Math.round((totalXp % 750) / 750 * 100)
  const learnerEntry: LeaderboardEntry = {
    id: 'current-learner', name: 'You', company: 'Engine 7',
    xp: totalXp, streakDays: studyActivity.streakDays,
    completedLessons: stats.completedLessons, perfectQuizzes: stats.perfectQuizzes,
  }

  const profileStats = [
    { icon: Trophy, label: 'Level', value: displayLevel.toString(), sub: `${totalXp.toLocaleString()} XP`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: Flame, label: 'Streak', value: `${studyActivity.streakDays}`, sub: 'days', color: 'text-red-400', bg: 'bg-red-500/10' },
    { icon: Activity, label: 'Daily goal', value: `${studyActivity.minutesToday}`, sub: `/${learnerProgress.dailyGoalMinutes}m`, color: 'text-green-400', bg: 'bg-green-500/10' },
  ]

  return <AppShell><div className="space-y-8">
    <section className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
      <Card className="space-y-4">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <UserCircle className="text-primary" size={28} />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Learner profile</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-gradient-fire">Your Firefighter Profile</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{authenticated ? 'Connected to Supabase. Progress saves automatically.' : 'Not signed in. Sign in from the dashboard to save progress.'}</p>
        </div>
        {authenticated && (
          <Button variant="outline" size="sm" onClick={async () => {
            const client = createFireLearnBrowserSupabaseClient()
            if (client) { await client.auth.signOut(); refresh() }
          }}><LogOut size={16} /> Sign out</Button>
        )}
      </Card>
      <Card className="grid gap-3 sm:grid-cols-3">
        {profileStats.map((stat) => (
          <div key={stat.label} className="stat-tile-hover rounded-2xl border border-border bg-elevated/40 p-5">
            <div className={cn('inline-flex size-12 items-center justify-center rounded-xl', stat.bg)}>
              <stat.icon className={stat.color} size={22} />
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{stat.value}<span className="text-sm text-muted"> {stat.sub}</span></p>
            <p className="text-xs text-muted">{stat.label}</p>
            {stat.label === 'Level' && <Progress className="mt-3 h-1.5" value={levelProgress} />}
          </div>
        ))}
      </Card>
    </section>
    <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
      <LeaderboardPanel learnerEntry={learnerEntry} />
      <WeeklyChallengesPanel challenges={stats.challenges} />
    </section>
    <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
      <AchievementProgressPanel achievements={stats.achievements} />
      <ProfileDataTools onReset={() => { refresh(); studyActivity.refresh() }} />
    </section>
  </div></AppShell>
}
