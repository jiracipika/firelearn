'use client'

import { BookOpen, Flame, Target, Trophy, UploadCloud } from 'lucide-react'
import { academyCourses, getFeaturedLesson } from '@/data/academy'
import { learnerProgress } from '@/data/progress'
import { useSupabaseProgress } from '@/hooks/use-supabase-progress'
import { getWeakTopicSummary } from '@/services/offline-progress'
import { AppShell } from '@/components/layout/app-shell'
import { CourseCard } from '@/components/course/course-card'
import { StudyHeatmap } from '@/components/dashboard/study-heatmap'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

function allLessonIds() {
  return academyCourses.flatMap((course) => course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)))
}

export function DashboardOverview() {
  const featuredLesson = getFeaturedLesson()
  const { completedLessonIds, quizHistory, available, authenticated, signIn, error } = useSupabaseProgress()
  const weakTopics = getWeakTopicSummary(quizHistory)
  const dailyProgress = Math.round((learnerProgress.minutesStudiedToday / learnerProgress.dailyGoalMinutes) * 100)
  const lessonIds = allLessonIds()
  const completion = lessonIds.length === 0 ? 0 : Math.round((completedLessonIds.length / lessonIds.length) * 100)
  const totalXp = learnerProgress.xp + completedLessonIds.length * 50
  const stats = [
    { label: 'Daily streak', value: `${learnerProgress.streakDays} days`, icon: Flame },
    { label: 'Total XP', value: totalXp.toLocaleString(), icon: Trophy },
    { label: 'Level', value: Math.max(learnerProgress.level, Math.floor(totalXp / 750) + 1).toString(), icon: Target },
    { label: 'Supabase completion', value: `${completion}%`, icon: BookOpen },
  ]

  return <AppShell><div className="space-y-8">
    <section className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => <Card key={stat.label}><stat.icon className="mb-4 text-red-300" aria-hidden /><p className="text-sm text-muted">{stat.label}</p><p className="mt-1 text-2xl font-semibold">{stat.value}</p></Card>)}
    </section>
    <section className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
      <Card className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-200">Continue learning</p>
        <h1 className="text-3xl font-semibold tracking-tight">{featuredLesson?.title ?? 'Start your first lesson'}</h1>
        <p className="max-w-2xl text-muted">Build fireground judgment with short lessons, checks, quizzes, and review cards that reinforce the same concept from multiple angles.</p>
        <Progress value={featuredLesson && completedLessonIds.includes(featuredLesson.id) ? 100 : (featuredLesson?.completion.percent ?? 0)} />
      </Card>
      <Card className="space-y-4">
        <p className="text-sm text-muted">Daily goal</p>
        <p className="text-4xl font-semibold">{learnerProgress.minutesStudiedToday}/{learnerProgress.dailyGoalMinutes}m</p>
        <Progress value={dailyProgress} />
        <p className="text-sm text-muted">Keep the streak alive with one focused session today.</p>
      </Card>
    </section>
    <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]"><StudyHeatmap /><Card><h2 className="font-semibold">Achievements</h2><div className="mt-4 flex flex-wrap gap-2">{learnerProgress.achievements.map((achievement) => <span key={achievement} className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm text-amber-100">{achievement}</span>)}</div><p className="mt-4 text-sm text-muted">Future-ready for badges, weekly challenges, medals, certificates, and department-level progress.</p></Card></section>
    <section className="grid gap-5 lg:grid-cols-3">
      <Card className="space-y-3"><div className="flex items-center gap-2"><UploadCloud className="size-5 text-red-300" /><h2 className="font-semibold">Supabase status</h2></div><p className="text-3xl font-semibold">{authenticated ? 'Connected' : 'Not signed in'}</p><p className="text-sm text-muted">{available ? 'Supabase env is configured. Sign in anonymously to save progress.' : 'Supabase env is missing from this deployment.'}</p>{!authenticated && <Button disabled={!available} onClick={signIn}>Sign in to Supabase</Button>}{error && <p className="text-sm text-red-200">{error}</p>}</Card>
      <Card className="space-y-3"><h2 className="font-semibold">Quiz history</h2>{quizHistory.length === 0 ? <p className="text-sm text-muted">No Supabase quiz attempts yet.</p> : <div className="space-y-2">{quizHistory.slice(0, 3).map((attempt) => <div key={`${attempt.quizId}-${attempt.completedAt}`} className="rounded-xl bg-white/[0.03] p-3 text-sm"><p className="font-medium">{attempt.quizId}</p><p className="text-muted">{attempt.scorePercent}% · {new Date(attempt.completedAt).toLocaleDateString()}</p></div>)}</div>}</Card>
      <Card className="space-y-3"><h2 className="font-semibold">Weak-topic recommendations</h2>{weakTopics.length === 0 ? <p className="text-sm text-muted">No weak topics yet. Complete quizzes to generate recommendations.</p> : <div className="flex flex-wrap gap-2">{weakTopics.slice(0, 5).map((topic) => <span key={topic.topicId} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-red-100">{topic.topicId} · {topic.misses}</span>)}</div>}</Card>
    </section>
    <section className="space-y-4"><h2 className="text-2xl font-semibold">Courses in progress</h2><div className="grid gap-4 md:grid-cols-3">{academyCourses.filter((course) => course.progressPercent > 0 || course.modules.some((module) => module.lessons.some((lesson) => completedLessonIds.includes(lesson.id)))).slice(0, 6).map((course) => <CourseCard key={course.id} course={course} />)}</div></section>
  </div></AppShell>
}
