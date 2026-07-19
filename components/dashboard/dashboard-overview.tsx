'use client'

import * as React from 'react'
import { Activity, BookOpen, Brain, ClipboardCheck, Flame, Target, Trophy, UploadCloud } from 'lucide-react'
import Link from 'next/link'
import { academyCourses, getFeaturedLesson } from '@/data/academy'
import { learnerProgress } from '@/data/progress'
import { useSupabaseProgress } from '@/hooks/use-supabase-progress'
import { useOfflineProgress } from '@/hooks/use-offline-progress'
import { useStudyActivity } from '@/hooks/use-study-activity'
import { useFlashcardQueueSummary } from '@/hooks/use-flashcard-queue-summary'
import { getWeakTopicSummary } from '@/services/offline-progress'
import { formatTopicLabel } from '@/services/topics'
import { aggregateLearnerStats } from '@/services/gamification-aggregator'
import { buildCompletedLessonAwards } from '@/services/lesson-xp'
import { chooseNextAction } from '@/services/next-action'
import { mergeCompletedLessonIds, mergeQuizHistory } from '@/services/progress-merge'
import { summarizeQuizHistory } from '@/services/quiz-history-summary'
import { getWeeklyStudyInsight } from '@/services/study-insight'
import type { LeaderboardEntry } from '@/services/gamification'
import { AppShell } from '@/components/layout/app-shell'
import { CourseCard } from '@/components/course/course-card'
import { AchievementProgressPanel, LeaderboardPanel, WeeklyChallengesPanel } from '@/components/dashboard/gamification-panels'
import { StudyHeatmap } from '@/components/dashboard/study-heatmap'
import { StudyTimerPanel } from '@/components/dashboard/study-timer-panel'
import { SupabaseSyncButton } from '@/components/sync/supabase-sync-button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

function allLessonIds() {
  return academyCourses.flatMap((course) => course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)))
}

export function DashboardOverview() {
  const featuredLesson = getFeaturedLesson()
  const supabaseProgress = useSupabaseProgress()
  const offlineProgress = useOfflineProgress()
  const { available, authenticated, loading, signIn, error, projectRef, refresh } = supabaseProgress
  const completedLessonIds = mergeCompletedLessonIds(supabaseProgress.completedLessonIds, offlineProgress.learnerState.completedLessonIds)
  const quizHistory = mergeQuizHistory(supabaseProgress.quizHistory, offlineProgress.quizHistory)
  const studyActivity = useStudyActivity()
  const flashcardQueue = useFlashcardQueueSummary()
  const weakTopics = getWeakTopicSummary(quizHistory)
  const quizSummary = summarizeQuizHistory(quizHistory)
  const flashcardsReviewed = studyActivity.activity.filter((entry) => entry.kind === 'flashcard_review').length
  const nextAction = chooseNextAction({
    courses: academyCourses,
    completedLessonIds,
    quizHistory,
    weakTopicIds: weakTopics.map((topic) => topic.topicId),
    dueFlashcardCount: flashcardQueue.dueCount,
  })
  const lessonIds = allLessonIds()
  const completion = lessonIds.length === 0 ? 0 : Math.round((completedLessonIds.length / lessonIds.length) * 100)

  const stats = (() => {
    const completedLessons = buildCompletedLessonAwards(academyCourses, completedLessonIds)

    return aggregateLearnerStats({
      completedLessons,
      quizAttempts: quizHistory,
      flashcardsReviewed,
      streakDays: studyActivity.streakDays,
    })
  })()

  const totalXp = learnerProgress.xp + stats.xp
  const studyInsight = getWeeklyStudyInsight({
    weeklyMinutes: studyActivity.weeklyMinutes,
    dailyGoalMinutes: learnerProgress.dailyGoalMinutes,
    streakDays: studyActivity.streakDays,
  })
  const learnerEntry: LeaderboardEntry = {
    id: 'current-learner',
    name: 'You',
    company: 'Your station',
    xp: totalXp,
    streakDays: studyActivity.streakDays,
    completedLessons: stats.completedLessons,
    perfectQuizzes: stats.perfectQuizzes,
  }

  const dailyProgress = Math.round((studyActivity.minutesToday / learnerProgress.dailyGoalMinutes) * 100)
  const displayLevel = Math.floor(totalXp / 750) + 1
  const statTiles = [
    { label: 'Daily streak', value: `${studyActivity.streakDays}`, suffix: 'days', icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Total XP', value: totalXp.toLocaleString(), suffix: '', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Level', value: displayLevel.toString(), suffix: '', icon: Target, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Completion', value: completion.toString(), suffix: '%', icon: BookOpen, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  ]

  return <AppShell><div className="space-y-8">
    <section className="grid gap-5 lg:grid-cols-[1fr_0.38fr] lg:items-stretch">
      <Card className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute right-0 top-0 size-40 rounded-full bg-primary/15 blur-3xl" />
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Command dashboard</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-[-0.03em] md:text-5xl text-gradient-fire">Keep your fireground knowledge mission-ready.</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Track completions, quiz history, and weak topics from one focused cockpit.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {statTiles.map((stat) => (
            <div key={stat.label} className="stat-tile-hover rounded-2xl border border-border bg-elevated/40 p-4">
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
              <p className="mt-1 text-3xl font-bold text-white">{studyActivity.minutesToday}<span className="text-lg text-muted">/{learnerProgress.dailyGoalMinutes}m</span></p>
            </div>
            <Activity className="text-red-400 animate-pulse-glow" size={24} />
          </div>
          <Progress value={dailyProgress} className="mt-4" />
        </div>
        <div className="grid gap-2 text-xs leading-5 text-muted-foreground">
          <p>Short reps win. Clear one lesson, one quiz, or one flashcard queue today.</p>
          <Link href="/flashcards" className="rounded-xl border border-border bg-elevated/40 px-3 py-2 transition hover:border-primary/50 hover:text-white">
            {flashcardQueue.dueCount > 0
              ? `${flashcardQueue.dueCount} flashcard${flashcardQueue.dueCount === 1 ? '' : 's'} due (${flashcardQueue.overdue} overdue)`
              : `${flashcardQueue.totalCards} flashcards scheduled · queue clear`}
          </Link>
        </div>
      </Card>
    </section>

    <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Continue learning</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-gradient-fire">{featuredLesson?.title ?? 'Start your first lesson'}</h2>
          </div>
          <Brain className="text-red-400" size={24} />
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{nextAction.description}</p>
        <Progress value={featuredLesson && completedLessonIds.includes(featuredLesson.id) ? 100 : (featuredLesson?.completion.percent ?? 0)} />
        <Link href={nextAction.href}>
          <Button size="sm">{nextAction.title}</Button>
        </Link>
      </Card>
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <UploadCloud className="text-red-400" size={18} />
          <h2 className="font-bold text-white">Supabase status</h2>
        </div>
        <p className="text-2xl font-bold text-white">{authenticated ? 'Connected' : 'Not signed in'}</p>
        <p className="text-xs leading-5 text-muted-foreground">
          {available ? `Project ${projectRef ?? 'unknown'} · Anonymous auth stores progress per user under RLS.` : 'Supabase env not configured.'}
        </p>
        {offlineProgress.syncQueueCount > 0 && (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-3 text-xs leading-5 text-amber-100">
            {offlineProgress.syncQueueCount} local progress item{offlineProgress.syncQueueCount === 1 ? '' : 's'} waiting to sync.
          </p>
        )}
        {!authenticated && <Button size="sm" disabled={!available || loading} onClick={signIn}>{loading ? 'Checking Supabase...' : 'Sign in anonymously'}</Button>}
        {authenticated && <SupabaseSyncButton onSynced={() => { refresh(); offlineProgress.refresh() }} />}
        {error && <p className="rounded-xl border border-red-500/30 bg-red-500/8 p-3 text-xs leading-5 text-red-200">{error}</p>}
      </Card>
    </section>

    <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
      <StudyTimerPanel />
      <WeeklyChallengesPanel challenges={stats.challenges} />
    </section>

    <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
      <StudyHeatmap weeklyActivity={studyActivity.weeklyMinutes} dayLabels={studyActivity.dayLabels} />
      <AchievementProgressPanel achievements={stats.achievements} />
    </section>

    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <LeaderboardPanel compact learnerEntry={learnerEntry} />
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Activity coach</p>
            <h2 className="mt-1 font-bold text-white">{studyInsight.title}</h2>
          </div>
          <ClipboardCheck className="shrink-0 text-red-400" size={22} />
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{studyInsight.summary}</p>
        <div className="rounded-xl border border-border bg-elevated/40 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">{studyInsight.metricLabel}</p>
          <p className="mt-1 text-2xl font-bold text-white">{studyInsight.metricValue}</p>
        </div>
      </Card>
    </section>

    <section className="grid gap-5 lg:grid-cols-2">
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-white">Quiz history</h2>
          {quizSummary.totalAttempts > 0 && (
            <span className={cn(
              'rounded-md border px-2 py-0.5 text-[11px] font-semibold tabular-nums',
              quizSummary.trend === 'improving'
                ? 'border-success/30 bg-success/10 text-success'
                : quizSummary.trend === 'declining'
                  ? 'border-red-500/30 bg-red-500/10 text-red-300'
                  : 'border-border bg-elevated/60 text-muted',
            )}>
              {quizSummary.trend === 'improving' ? '↗ Improving' : quizSummary.trend === 'declining' ? '↘ Declining' : quizSummary.trend === 'steady' ? '→ Steady' : ''}
            </span>
          )}
        </div>
        {quizHistory.length === 0
          ? <p className="text-sm text-muted-foreground">No quiz attempts yet. Complete a quiz after signing in.</p>
          : <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'Average', value: `${quizSummary.averageScorePercent}%`, tone: quizSummary.averageScorePercent >= 70 ? 'text-success' : 'text-white' },
                { label: 'Best', value: `${quizSummary.bestScorePercent}%`, tone: 'text-white' },
                { label: 'Pass rate', value: `${quizSummary.passRatePercent}%`, tone: 'text-white' },
                { label: 'Perfect', value: `${quizSummary.perfectCount}`, tone: 'text-amber-400' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-elevated/40 px-3 py-2.5 text-center">
                  <p className={cn('text-xl font-bold tabular-nums', stat.tone)}>{stat.value}</p>
                  <p className="text-[11px] text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              {quizSummary.totalAttempts} attempt{quizSummary.totalAttempts === 1 ? '' : 's'} · recent average {quizSummary.recentAverageScorePercent}%
              {quizSummary.trend !== 'insufficient' && quizSummary.trendDelta !== 0 && (
                <span className={quizSummary.trend === 'improving' ? 'text-success' : 'text-red-300'}>
                  {' '}({quizSummary.trendDelta > 0 ? '+' : ''}{quizSummary.trendDelta} pts)
                </span>
              )}
            </p>
            <div className="space-y-2 border-t border-border pt-2">
              {quizHistory.slice(0, 5).map((attempt) => (
                <div key={`${attempt.quizId}-${attempt.completedAt}`} className="rounded-xl border border-border bg-elevated/40 px-4 py-2.5 text-sm">
                  <p className="font-medium text-white">{attempt.quizId}</p>
                  <p className="text-xs text-muted">{attempt.scorePercent}% · {new Date(attempt.completedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </>
        }
      </Card>
      <Card className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-bold text-white">Weak-topic recommendations</h2>
          {weakTopics.length > 0 && (
            <span className="text-xs text-muted">{weakTopics.length} topic{weakTopics.length === 1 ? '' : 's'} flagged</span>
          )}
        </div>
        {weakTopics.length === 0
          ? <p className="text-sm text-muted-foreground">No weak topics yet. FireLearn surfaces repeated misses after quizzes.</p>
          : <div className="flex flex-wrap gap-2">{weakTopics.slice(0, 8).map((topic) => (
              <Link
                key={topic.topicId}
                href={`/search?q=${encodeURIComponent(formatTopicLabel(topic.topicId))}`}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/8 px-3 py-1.5 text-xs text-red-200 transition hover:border-primary/60 hover:bg-primary/15 hover:text-white"
                title={`Review ${formatTopicLabel(topic.topicId)} — ${topic.misses} miss${topic.misses === 1 ? '' : 'es'}`}
              >
                <span className="font-medium">{formatTopicLabel(topic.topicId)}</span>
                <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-red-100">{topic.misses}</span>
              </Link>
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
        {academyCourses.filter((course) => course.modules.some((module) => module.lessons.some((lesson) => completedLessonIds.includes(lesson.id)))).slice(0, 6).map((course) => <CourseCard key={course.id} course={course} />)}
      </div>
      {academyCourses.filter((course) => course.modules.some((module) => module.lessons.some((lesson) => completedLessonIds.includes(lesson.id)))).length === 0 && (
        <Card className="py-12 text-center text-muted-foreground">
          <p>No courses started yet.</p>
          <Link href="/courses" className="mt-2 inline-block text-sm font-semibold text-primary hover:opacity-80">Browse the academy to begin</Link>
        </Card>
      )}
    </section>
  </div></AppShell>
}
