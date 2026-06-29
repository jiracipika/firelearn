import { BookOpen, Brain, Clock, Layers, LibraryBig } from 'lucide-react'
import type { Course } from '@/types/learning'
import { getCategoryTitle } from '@/data/academy'
import { getCourseStats } from '@/lib/academy-selectors'
import { AppShell } from '@/components/layout/app-shell'
import { LessonCard } from '@/components/course/lesson-card'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function CourseDetail({ course }: { course: Course }) {
  const stats = getCourseStats(course)
  const statItems = [
    { label: 'Minutes', value: course.estimatedMinutes, icon: Clock },
    { label: 'Modules', value: stats.moduleCount, icon: Layers },
    { label: 'Lessons', value: stats.lessonCount, icon: BookOpen },
    { label: 'Questions', value: stats.quizQuestionCount, icon: Brain },
    { label: 'Cards', value: stats.flashcardCount, icon: LibraryBig },
  ]
  return <AppShell><div className="space-y-9">
    <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <Card className="relative overflow-hidden p-7"><div className="absolute right-0 top-0 size-56 rounded-full bg-primary/20 blur-3xl" /><Badge>{getCategoryTitle(course.categoryId)}</Badge><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] md:text-6xl">{course.title}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-muted">{course.description}</p><Progress value={course.progressPercent} className="mt-6" /></Card>
      <Card className="grid gap-3">{statItems.map((item) => <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-black/20 p-3"><span className="flex items-center gap-2 text-sm text-muted"><item.icon size={16} /> {item.label}</span><span className="font-semibold text-white">{item.value}</span></div>)}</Card>
    </section>
    {course.modules.map((module, moduleIndex) => <section key={module.id} className="space-y-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">Module {moduleIndex + 1}</p><h2 className="mt-1 text-3xl font-semibold tracking-tight">{module.title}</h2><p className="mt-1 text-muted">{module.description}</p></div></div><div className="grid gap-4 md:grid-cols-2">{module.lessons.map((lesson) => <LessonCard key={lesson.id} courseSlug={course.slug} lesson={lesson} />)}</div></section>)}
  </div></AppShell>
}
