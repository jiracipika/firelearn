import { BookOpen, Flame, Target, Trophy } from 'lucide-react'
import { academyCourses, getFeaturedLesson } from '@/data/academy'
import { learnerProgress } from '@/data/progress'
import { AppShell } from '@/components/layout/app-shell'
import { CourseCard } from '@/components/course/course-card'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function DashboardOverview() {
  const featuredLesson = getFeaturedLesson()
  const dailyProgress = Math.round((learnerProgress.minutesStudiedToday / learnerProgress.dailyGoalMinutes) * 100)
  const stats = [
    { label: 'Daily streak', value: `${learnerProgress.streakDays} days`, icon: Flame },
    { label: 'Total XP', value: learnerProgress.xp.toLocaleString(), icon: Trophy },
    { label: 'Level', value: learnerProgress.level.toString(), icon: Target },
    { label: 'Courses active', value: academyCourses.filter((course) => course.progressPercent > 0).length.toString(), icon: BookOpen },
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
        <Progress value={featuredLesson?.completion.percent ?? 0} />
      </Card>
      <Card className="space-y-4">
        <p className="text-sm text-muted">Daily goal</p>
        <p className="text-4xl font-semibold">{learnerProgress.minutesStudiedToday}/{learnerProgress.dailyGoalMinutes}m</p>
        <Progress value={dailyProgress} />
        <p className="text-sm text-muted">Keep the streak alive with one focused session today.</p>
      </Card>
    </section>
    <section className="space-y-4"><h2 className="text-2xl font-semibold">Courses in progress</h2><div className="grid gap-4 md:grid-cols-3">{academyCourses.map((course) => <CourseCard key={course.id} course={course} />)}</div></section>
  </div></AppShell>
}
