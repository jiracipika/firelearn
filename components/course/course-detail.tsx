import { BookOpen, Brain, Clock, Layers, LibraryBig, PlayCircle } from 'lucide-react'
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
  const videoCount = course.modules.reduce((total, module) => total + module.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.videos.length, 0), 0)
  const statItems = [
    { label: 'Minutes', value: course.estimatedMinutes, icon: Clock },
    { label: 'Modules', value: stats.moduleCount, icon: Layers },
    { label: 'Lessons', value: stats.lessonCount, icon: BookOpen },
    { label: 'Videos', value: videoCount, icon: PlayCircle },
    { label: 'Questions', value: stats.quizQuestionCount, icon: Brain },
    { label: 'Cards', value: stats.flashcardCount, icon: LibraryBig },
  ]
  return <AppShell><div className="space-y-9">
    <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <Card className="relative overflow-hidden border-border-bright p-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-info" />
        <Badge>{getCategoryTitle(course.categoryId)}</Badge>
        <h1 className="mt-5 max-w-4xl text-3xl font-bold tracking-[-0.03em] md:text-5xl">{course.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-7 text-muted-foreground">{course.description}</p>
        <Progress value={course.progressPercent} className="mt-6" />
        <p className="mt-2 text-xs text-muted">{course.progressPercent}% complete</p>
      </Card>
      <Card className="grid gap-2 border-border-bright">
        {statItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg border border-border bg-elevated/40 px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-muted-foreground"><item.icon size={16} /> {item.label}</span>
            <span className="font-bold text-white">{item.value}</span>
          </div>
        ))}
      </Card>
    </section>
    {course.modules.map((module, moduleIndex) => (
      <section key={module.id} className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Module {moduleIndex + 1}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">{module.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {module.lessons.map((lesson) => <LessonCard key={lesson.id} courseSlug={course.slug} lesson={lesson} />)}
        </div>
      </section>
    ))}
  </div></AppShell>
}
