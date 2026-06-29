'use client'

import * as React from 'react'
import { Activity, BookOpen, Brain, Flame, Target, Trophy, UploadCloud } from 'lucide-react'
import { academyCourses, getFeaturedLesson } from '@/data/academy'
import { learnerProgress } from '@/data/progress'
import { useSupabaseProgress } from '@/hooks/use-supabase-progress'
import { getWeakTopicSummary } from '@/services/offline-progress'
import { aggregateLearnerStats } from '@/services/gamification-aggregator'
import type { LeaderboardEntry } from '@/services/gamification'
import { AppShell } from '@/components/layout/app-shell'
import { CourseCard } from '@/components/course/course-card'
import { AchievementProgressPanel, LeaderboardPanel, WeeklyChallengesPanel } from '@/components/dashboard/gamification-panels'
import { StudyHeatmap } from '@/components/dashboard/study-heatmap'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

function allLessonIds() {
  return academyCourses.flatMap((course) => course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)))
}

export function DashboardOverview() {
  const featuredLesson = getFeaturedLesson()
  const { completedLessonIds, quizHistory, available, authenticated, signIn, error } = useSupabaseProgress()
  const weakTopics = getWeakTopicSummary(quizHistory)
  const lessonIds = allLessonIds()
  const completion = lessonIds.length === 0 ? 0 : Math.round((completedLessonIds.length / lessonIds.length) * 100)

  const stats = (() => {
    const completedLessons = completedLessonIds.map((lessonId) => {
      const course = academyCourses.find((course) =>
        course.modules.some((module) => module.lessons.some((lesson) => lesson.id === lessonId))
      )
      return {
        lessonId,
        courseId: course?.slug ?? 'unknown',
        xpAwarded: course?.xp ?? 50,
      }
    })
    return aggregateLearnerStats({
      completedLessons,
      quizAttempts: quizHistory,
      flashcardsReviewed: 0,
      streakDays: learnerProgress.streakDays,
    })
  })()

  const totalXp = learnerProgress.xp + stats.xp
  const learnerEntry: LeaderboardEntry = {
    id: 'current-learner',
    name: 'You',
    company: 'Engine 7',
    xp: totalXp,
    streakDays: learnerProgress.streakDays,
    completedLessons: stats.completedLessons,
    perfectQuizzes: stats.perfectQuizzes,
  }

  const dailyProgress = Math.round((learnerProgress.minutesStudiedToday / learnerProgress.dailyGoalMinutes) * 100)
  const displayLevel = Math.floor(totalXp / 750) + 1
  const statTiles = [
    { label: 'Daily streak', value: `${learnerProgress.streakDays}`, suffix: 'days', icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Total XP', value: totalXp.toLocaleString(), suffix: '', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Level', value: displayLevel.toString(), suffix: '', icon: Target, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Completion', value: completion.toString(), suffix: '%', icon: BookOpen, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  ]

  return <AppShell><div className="space-y-8">
    <section className="grid gap-5 lg:grid-cols-[1fr_0.38fr] lg:items-stretch">
      <Card className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute right-0 top-0 size-40 rounded-full bg-primary/15 blur-3xl" />
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Command dashboard</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-[-0.03em] md:text-5xl">Keep your fireground knowledge mission-ready.</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Track completions, quiz history, and weak topics from one focused cockpit.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {statTiles.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-elevated/40 p-4">
              <div className={cn('inline-flex size-10 items-center justify-center rounded-xl', stat.bg)}>
                <stat.icon className={stat.color} size={20} />
              </div>
              <p className="mt-3 text-2xl font-bold text-white">{stat.value}<span className="text-sm text-muted">{stat.suffix}</span></p>
              <p className="text-xs text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="flex flex-col justify-between gap-4 bg-gradient-to-br from-primary/8 to-transparent">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Daily goal</p>
              <p className="mt-1 text-3xl font-bold text-white">{learnerProgress.minutesStudiedToday}<span className="text-lg text-muted">/{learnerProgress.dailyGoalMinutes}m</span></p>
            </div>
            <Activity className="text-red-400" size={24} />
          </div>
          <Progress value={dailyProgress} className="mt-4" />
        </div>
        <p className="text-xs leading-5 text-muted-foreground">Short reps win. Clear one lesson, one quiz, or one flashcard queue today.</p>
      </Card>
    </section>

    <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Continue learning</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">{featuredLesson?.title ?? 'Start your first lesson'}</h2>
          </div>
          <Brain className="text-red-400" size={24} />
        </div>
        <p className="text-sm leading-6 text-muted-foreground">Pick up the highest-value module and keep building recall.</p>
        <Progress value={featuredLesson && completedLessonIds.includes(featuredLesson.id) ? 100 : (featuredLesson?.completion.percent ?? 0)} />
      </Card>
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <UploadCloud className="text-red-400" size={18} />
          <h2 className="font-bold text-white">Supabase status</h2>
        </div>
        <p className="text-2xl font-bold text-white">{authenticated ? 'Connected' : 'Not signed in'}</p>
        <p className="text-xs leading-5 text-muted-foreground">{available ? 'Anonymous auth stores progress per user under RLS.' : 'Supabase env not configured.'}</p>
        {!authenticated && <Button size="sm" disabled={!available} onClick={signIn}>Sign in anonymously</Button>}
        {error && <p className="text-xs text-red-300">{error}</p>}
      </Card>
    </section>

    <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
      <StudyHeatmap />
      <WeeklyChallengesPanel challenges={stats.challenges} />
    </section>

    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <LeaderboardPanel compact learnerEntry={learnerEntry} />
      <AchievementProgressPanel achievements={stats.achievements} />
    </section>

    <section className="grid gap-5 lg:grid-cols-2">
      <Card className="space-y-3">
        <h2 className="font-bold text-white">Quiz history</h2>
        {quizHistory.length === 0
          ? <p className="text-sm text-muted-foreground">No quiz attempts yet. Complete a quiz after signing in.</p>
          : <div className="space-y-2">{quizHistory.slice(0, 5).map((attempt) => (
              <div key={`${attempt.quizId}-${attempt.completedAt}`} className="rounded-xl border border-border bg-elevated/40 px-4 py-2.5 text-sm">
                <p className="font-medium text-white">{attempt.quizId}</p>
                <p className="text-xs text-muted">{attempt.scorePercent}% · {new Date(attempt.completedAt).toLocaleDateString()}</p>
              </div>
            ))}</div>
        }
      </Card>
      <Card className="space-y-3">
        <h2 className="font-bold text-white">Weak-topic recommendations</h2>
        {weakTopics.length === 0
          ? <p className="text-sm text-muted-foreground">No weak topics yet. FireLearn surfaces repeated misses after quizzes.</p>
          : <div className="flex flex-wrap gap-2">{weakTopics.slice(0, 8).map((topic) => (
              <span key={topic.topicId} className="rounded-lg border border-primary/30 bg-primary/8 px-3 py-1 text-xs text-red-200">{topic.topicId} · {topic.misses}</span>
            ))}</div>
        }
      </Card>
    </section>

    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Courses in progress</h2>
        <p className="mt-1 text-sm text-muted-foreground">Prioritized modules based on current progress.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {academyCourses.filter((course) => course.progressPercent > 0 || course.modules.some((module) => module.lessons.some((lesson) => completedLessonIds.includes(lesson.id)))).slice(0, 6).map((course) => <CourseCard key={course.id} course={course} />)}
      </div>
    </section>
  </div></AppShell>
}
