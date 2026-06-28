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
  return <AppShell><div className="space-y-8">
    <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="space-y-5">
        <Badge>{getCategoryTitle(course.categoryId)}</Badge>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">{course.title}</h1>
        <p className="max-w-3xl text-lg leading-8 text-muted">{course.description}</p>
        <Progress value={course.progressPercent} />
      </div>
      <Card className="grid gap-4 text-sm text-muted">
        <p className="flex items-center gap-2"><Clock size={16} /> {course.estimatedMinutes} minutes</p>
        <p className="flex items-center gap-2"><Layers size={16} /> {stats.moduleCount} module(s)</p>
        <p className="flex items-center gap-2"><BookOpen size={16} /> {stats.lessonCount} lesson(s)</p>
        <p className="flex items-center gap-2"><Brain size={16} /> {stats.quizQuestionCount} quiz question(s)</p>
        <p className="flex items-center gap-2"><LibraryBig size={16} /> {stats.flashcardCount} flashcard(s)</p>
      </Card>
    </section>
    {course.modules.map((module) => <section key={module.id} className="space-y-4"><div><h2 className="text-2xl font-semibold">{module.title}</h2><p className="mt-1 text-muted">{module.description}</p></div><div className="grid gap-4 md:grid-cols-2">{module.lessons.map((lesson) => <LessonCard key={lesson.id} courseSlug={course.slug} lesson={lesson} />)}</div></section>)}
  </div></AppShell>
}
