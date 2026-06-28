'use client'

import Link from 'next/link'
import { CheckCircle2, PlayCircle } from 'lucide-react'
import type { Course, Lesson } from '@/types/learning'
import { useOfflineProgress } from '@/hooks/use-offline-progress'
import { AppShell } from '@/components/layout/app-shell'
import { ContentBlock } from '@/components/course/content-block'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

function lessonProgressPercent(completed: boolean, lesson: Lesson) {
  if (completed) return 100
  return lesson.completion.percent
}

export function LessonView({ course, lesson }: { course: Course; lesson: Lesson }) {
  const { learnerState, completeLesson, syncQueueCount } = useOfflineProgress()
  const completed = learnerState.completedLessonIds.includes(lesson.id)
  const progress = lessonProgressPercent(completed, lesson)

  return <AppShell><article className="mx-auto max-w-4xl space-y-6">
    <Link href={`/courses/${course.slug}`} className="text-sm text-muted hover:text-white">← {course.title}</Link>
    <Badge>{lesson.difficulty} · {lesson.estimatedMinutes} min</Badge>
    <div className="space-y-3"><h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{lesson.title}</h1><p className="text-muted">{lesson.videoPlaceholder}</p><Progress value={progress} /></div>
    <Card className="flex flex-wrap items-center justify-between gap-4 border-primary/20 bg-primary/5">
      <div><h2 className="font-semibold">Offline progress</h2><p className="mt-1 text-sm text-muted">{completed ? 'Completed locally. It will sync when Supabase is connected.' : 'Complete this lesson locally now; Supabase can replay it later.'}</p><p className="mt-1 text-xs text-muted">Pending sync operations: {syncQueueCount}</p></div>
      <Button disabled={completed} onClick={() => completeLesson({ lessonId: lesson.id, courseId: course.id, xpAwarded: Math.max(25, Math.round(course.xp / Math.max(1, course.modules.flatMap((module) => module.lessons).length))) })}>{completed ? 'Completed' : 'Mark complete'}</Button>
    </Card>
    <Card className="grid gap-6 md:grid-cols-2"><div><h2 className="font-semibold">Objectives</h2><ul className="mt-3 space-y-2 text-sm text-muted">{lesson.objectives.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />{item}</li>)}</ul></div><div><h2 className="font-semibold">Prerequisites</h2><ul className="mt-3 space-y-2 text-sm text-muted">{lesson.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul></div></Card>
    <Card className="flex min-h-56 items-center justify-center border-dashed text-muted"><PlayCircle className="mr-2" /> Video placeholder · {lesson.imageAlt}</Card>
    {lesson.content.map((block, index) => <ContentBlock key={`${block.type}-${index}`} block={block} />)}
    <Card><h2 className="font-semibold">Knowledge check</h2><p className="mt-2 text-muted">{lesson.knowledgeCheck.prompt}</p><ul className="mt-3 grid gap-2 text-sm text-muted">{lesson.knowledgeCheck.options.map((option) => <li key={option} className="rounded-xl border border-border bg-white/[0.03] p-3">{option}</li>)}</ul></Card>
    <Card><h2 className="font-semibold">Summary</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-muted">{lesson.summary.map((item) => <li key={item}>{item}</li>)}</ul></Card>
    <Card><h2 className="font-semibold">Quiz and flashcards</h2><p className="mt-2 text-muted">This lesson includes {lesson.quiz.length} quiz question(s) and {lesson.flashcards.length} spaced-repetition card(s).</p></Card>
    <Card><h2 className="font-semibold">References</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-muted">{lesson.references.map((item) => <li key={item}>{item}</li>)}</ul></Card>
  </article></AppShell>
}
