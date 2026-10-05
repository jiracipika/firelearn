'use client'

import Link from 'next/link'
import { ArrowRight, Brain, CheckCircle2, ChevronDown, Cloud, RotateCcw } from 'lucide-react'
import { academyCourses } from '@/data/academy'
import { learnerProgress } from '@/data/progress'
import { useSupabaseProgress } from '@/hooks/use-supabase-progress'
import { useOfflineProgress } from '@/hooks/use-offline-progress'
import { useStudyActivity } from '@/hooks/use-study-activity'
import { useFlashcardQueueSummary } from '@/hooks/use-flashcard-queue-summary'
import { getWeakTopicSummary } from '@/services/offline-progress'
import { formatTopicLabel } from '@/services/topics'
import { aggregateLearnerStats } from '@/services/gamification-aggregator'
import { buildCompletedLessonAwards } from '@/services/lesson-xp'
import { mergeCompletedLessonIds, mergeQuizHistory } from '@/services/progress-merge'
import { describeQuizAttempt } from '@/services/quiz-attempt-display'
import { buildAdaptiveStudyPlan, type StudyRecommendationReason } from '@/services/adaptive-study-plan'
import { AppShell } from '@/components/layout/app-shell'
import { CourseCard } from '@/components/course/course-card'
import { AchievementProgressPanel, WeeklyChallengesPanel } from '@/components/dashboard/gamification-panels'
import { StudyHeatmap } from '@/components/dashboard/study-heatmap'
import { StudyTimerPanel } from '@/components/dashboard/study-timer-panel'
import { SupabaseSyncButton } from '@/components/sync/supabase-sync-button'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const recommendationCopy: Record<StudyRecommendationReason, { label: string; description: string; action: string }> = {
  'reinforce-weak-topic': { label: 'Worth another look', description: 'This lesson covers a topic from your recent missed questions.', action: 'Review lesson' },
  'continue-course': { label: 'Pick up where you left off', description: 'Your next unfinished lesson. Continue whenever you’re ready.', action: 'Continue learning' },
  'start-course': { label: 'A place to start', description: 'Try a short lesson, or browse the courses to find a topic that interests you.', action: 'Start lesson' },
}

export function DashboardOverview() {
  const savedProgress = useSupabaseProgress()
  const localProgress = useOfflineProgress()
  const { available, authenticated, loading, signIn, error, refresh } = savedProgress
  const completedLessonIds = mergeCompletedLessonIds(savedProgress.completedLessonIds, localProgress.learnerState.completedLessonIds)
  const completedSet = new Set(completedLessonIds)
  const quizHistory = mergeQuizHistory(savedProgress.quizHistory, localProgress.quizHistory)
  const studyActivity = useStudyActivity()
  const flashcardQueue = useFlashcardQueueSummary()
  const weakTopics = getWeakTopicSummary(quizHistory)
  const studyPlan = buildAdaptiveStudyPlan({ courses: academyCourses, completedLessonIds, quizHistory })
  const suggestion = studyPlan[0]
  const copy = suggestion ? recommendationCopy[suggestion.reason] : undefined
  const lessonCount = academyCourses.reduce((sum, course) => sum + course.modules.reduce((total, module) => total + module.lessons.length, 0), 0)
  const completedCount = academyCourses.reduce((sum, course) => sum + course.modules.reduce((total, module) => total + module.lessons.filter(lesson => completedSet.has(lesson.id)).length, 0), 0)
  const inProgress = academyCourses.filter(course => {
    const lessons = course.modules.flatMap(module => module.lessons)
    const completed = lessons.filter(lesson => completedSet.has(lesson.id)).length
    return completed > 0 && completed < lessons.length
  })
  const dailyProgress = Math.round(studyActivity.minutesToday / learnerProgress.dailyGoalMinutes * 100)
  const stats = aggregateLearnerStats({
    completedLessons: buildCompletedLessonAwards(academyCourses, completedLessonIds),
    quizAttempts: quizHistory,
    flashcardsReviewed: studyActivity.activity.filter(entry => entry.kind === 'flashcard_review').length,
    streakDays: studyActivity.streakDays,
  })

  return <AppShell><div className="fl-dashboard space-y-8">
    <div>
      <p className="fl-kicker">Your space to study</p>
      <h1 className="fl-dashboard-title mt-2">{completedCount > 0 ? 'Welcome back.' : 'Make yourself at home.'}</h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">{completedCount > 0 ? 'Your progress is here. Take the next step at your own pace.' : 'Start with a lesson, try a quiz, or simply have a look around.'}</p>
    </div>

    <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]" aria-label="Your next step">
      <Card className="fl-dashboard-focus flex flex-col items-start p-6 sm:p-8">
        {suggestion && copy ? <>
          <p className="fl-kicker">{copy.label}</p>
          <h2 className="mt-4 font-semibold">{suggestion.lessonTitle}</h2>
          <p className="mt-2 text-sm text-muted">{suggestion.courseTitle}</p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">{copy.description}</p>
          <Link href={suggestion.href} className={cn(buttonVariants(), 'mt-6')}>{copy.action} <ArrowRight size={17} aria-hidden /></Link>
          <Link href="/courses" className="fl-text-link mt-2">Choose a different topic</Link>
        </> : <>
          <CheckCircle2 className="text-success" size={28} aria-hidden />
          <h2 className="mt-4 font-semibold">Every lesson, completed.</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">You can revisit any course or keep reviewing with flashcards.</p>
          <Link href="/courses" className={cn(buttonVariants(), 'mt-6')}>Revisit the courses <ArrowRight size={17} aria-hidden /></Link>
        </>}
      </Card>
      <div className="grid gap-4">
        <Link href="/flashcards" className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary">
          <div className="flex items-center gap-3"><RotateCcw size={20} className="text-primary" aria-hidden /><h2 className="font-semibold">A quick refresher</h2><ArrowRight size={17} className="ml-auto shrink-0 text-muted" aria-hidden /></div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{flashcardQueue.dueCount > 0 ? `${flashcardQueue.dueCount} cards ready to review. Do a few or work through the queue.` : 'You’re up to date. You can still revisit your cards whenever you like.'}</p>
        </Link>
        <Link href="/quiz" className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary">
          <div className="flex items-center gap-3"><Brain size={20} className="text-primary" aria-hidden /><h2 className="font-semibold">Try some practice</h2><ArrowRight size={17} className="ml-auto shrink-0 text-muted" aria-hidden /></div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Scenario questions with explanations. Take your time and learn as you go.</p>
        </Link>
      </div>
    </section>

    <section aria-label="Your progress" className="fl-dashboard-stats">
      <div><p className="text-2xl font-semibold tabular-nums">{completedCount}<span className="text-sm font-normal text-muted"> / {lessonCount}</span></p><p className="mt-1 text-xs text-muted-foreground">Lessons completed</p></div>
      <div><p className="text-2xl font-semibold tabular-nums">{studyActivity.minutesToday}<span className="text-sm font-normal text-muted"> min</span></p><p className="mt-1 text-xs text-muted-foreground">Studied today</p></div>
      <div><p className="text-2xl font-semibold tabular-nums">{quizHistory.length}</p><p className="mt-1 text-xs text-muted-foreground">Practice sessions</p></div>
    </section>

    {inProgress.length > 0 && <section aria-labelledby="continue-title">
      <div className="fl-section-heading"><h2 id="continue-title" className="text-xl font-semibold">Your courses</h2><Link href="/courses" className="fl-text-link">All courses <ArrowRight size={16} aria-hidden /></Link></div>
      <div className="fl-course-grid">{inProgress.slice(0, 3).map(course => <CourseCard key={course.id} course={course} completedLessonIds={completedLessonIds} />)}</div>
    </section>}

    <section className="grid gap-5 lg:grid-cols-2" aria-label="Study time">
      <StudyTimerPanel />
      <Card className="flex flex-col justify-center p-6">
        <div className="flex items-baseline justify-between gap-4"><h2 className="font-semibold">Time for yourself</h2><span className="text-sm tabular-nums text-muted-foreground">{studyActivity.minutesToday} / {learnerProgress.dailyGoalMinutes} min</span></div>
        <Progress value={dailyProgress} label="Daily study goal" className="mt-4" />
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{dailyProgress >= 100 ? 'You’ve met your study goal for today. Come back whenever you’re ready.' : 'A few minutes is a good start. Your daily goal is a guide; work at your own pace.'}</p>
      </Card>
    </section>

    <details className="fl-dashboard-details">
      <summary>Your activity and achievements <ChevronDown size={18} aria-hidden /></summary>
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <StudyHeatmap weeklyActivity={studyActivity.weeklyMinutes} dayLabels={studyActivity.dayLabels} />
        <WeeklyChallengesPanel challenges={stats.challenges} />
        <AchievementProgressPanel achievements={stats.achievements} />
        <Card className="space-y-4">
          <h2 className="font-semibold">Recent practice</h2>
          {quizHistory.length === 0 ? <p className="text-sm leading-6 text-muted-foreground">Your completed quizzes will appear here. No account needed.</p> : <div className="space-y-2">{quizHistory.slice(0, 5).map(attempt => {
            const display = describeQuizAttempt(attempt)
            return <Link key={`${attempt.quizId}-${attempt.completedAt}`} href="/quiz" className="block rounded-xl bg-elevated/50 p-3"><div className="flex items-start justify-between gap-3"><span className="text-sm font-medium">{display.shortTitle}</span><span className="text-sm font-semibold tabular-nums">{attempt.scorePercent}%</span></div><p className="mt-1 text-xs text-muted">{display.whenLabel}</p></Link>
          })}</div>}
          {weakTopics.length > 0 && <div className="border-t border-border pt-4"><h3 className="text-sm font-semibold">Topics to revisit</h3><div className="mt-2 flex flex-wrap gap-2">{weakTopics.slice(0, 6).map(topic => <Link key={topic.topicId} href={`/search?q=${encodeURIComponent(formatTopicLabel(topic.topicId))}`} className="rounded-lg border border-border px-3 py-2 text-xs text-primary">{formatTopicLabel(topic.topicId)}</Link>)}</div></div>}
        </Card>
      </div>
    </details>

    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
      <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status"><Cloud size={17} className="shrink-0" aria-hidden />{authenticated ? localProgress.syncQueueCount > 0 ? 'Saved on this device. Changes are waiting to sync.' : 'Cloud save connected. Progress also saves on this device.' : 'Your progress saves on this device.'}</p>
      {available && (authenticated ? <SupabaseSyncButton onSynced={() => { refresh(); localProgress.refresh() }} /> : <Button variant="outline" size="sm" disabled={loading} onClick={signIn}>{loading ? 'Connecting…' : 'Connect cloud save'}</Button>)}
      {error && <p className="w-full text-sm text-red-300" role="status">Cloud save couldn’t connect. Your local progress is still available.</p>}
    </div>
  </div></AppShell>
}
