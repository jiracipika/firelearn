'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ClipboardCheck, PlayCircle, ShieldCheck } from 'lucide-react'
import type { Course, Lesson } from '@/types/learning'
import { useSupabaseProgress } from '@/hooks/use-supabase-progress'
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
  const { completedLessonIds, completeLesson, available, authenticated, loading, signIn, error, projectRef } = useSupabaseProgress()
  const completed = completedLessonIds.includes(lesson.id)
  const progress = lessonProgressPercent(completed, lesson)
  const xpAwarded = Math.max(25, Math.round(course.xp / Math.max(1, course.modules.flatMap((module) => module.lessons).length)))

  return <AppShell>
    <article className="mx-auto max-w-4xl space-y-6">
      <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-white">
        <ArrowLeft size={16} /> {course.title}
      </Link>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.4fr]">
        <Card className="relative overflow-hidden p-6 md:p-8">
          <div className="absolute right-0 top-0 size-48 rounded-full bg-primary/12 blur-3xl" />
          <Badge>{lesson.difficulty} · {lesson.estimatedMinutes} min</Badge>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em] text-white md:text-5xl">{lesson.title}</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">{lesson.videoPlaceholder}</p>
          <Progress value={progress} className="mt-5" />
          <p className="mt-2 text-xs text-muted">{progress}% complete</p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-red-400" size={18} />
            <h2 className="font-bold text-white">Save progress</h2>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            {!available ? 'Supabase not configured in this deployment.'
            : !authenticated ? `Sign in anonymously to save completion${projectRef ? ` on project ${projectRef}` : ''}.`
            : completed ? 'Completed and saved.'
            : 'Save this completion to Supabase.'}
          </p>
          {error && <p className="rounded-lg border border-red-500/30 bg-red-500/8 p-2.5 text-xs text-red-300">{error}</p>}
          {!authenticated
            ? <Button size="sm" disabled={!available || loading} onClick={signIn}>{loading ? 'Checking Supabase...' : 'Sign in to save'}</Button>
            : <Button size="sm" disabled={completed} onClick={() => completeLesson({ lessonId: lesson.id, courseId: course.id, xpAwarded })}>{completed ? 'Completed' : `Mark complete · ${xpAwarded} XP`}</Button>
          }
        </Card>
      </section>

      <Card className="grid gap-5 md:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-white"><ClipboardCheck size={18} className="text-red-400" /> Objectives</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
            {lesson.objectives.map((item) => <li key={item} className="flex gap-2.5"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /><span>{item}</span></li>)}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-white">Prerequisites</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {lesson.prerequisites.map((item) => <li key={item} className="rounded-lg border border-border bg-elevated/40 px-3 py-2">{item}</li>)}
          </ul>
        </div>
      </Card>

      <Card className="flex min-h-48 items-center justify-center border-dashed border-border-bright bg-elevated/20 text-muted-foreground">
        <div className="flex items-center gap-2"><PlayCircle className="text-red-400" size={20} /> Video placeholder · {lesson.imageAlt}</div>
      </Card>

      <div className="grid gap-4">
        {lesson.content.map((block, index) => <ContentBlock key={`${block.type}-${index}`} block={block} />)}
      </div>

      <Card>
        <h2 className="font-bold text-white">Knowledge check</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{lesson.knowledgeCheck.prompt}</p>
        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
          {lesson.knowledgeCheck.options.map((option) => <li key={option} className="rounded-xl border border-border bg-elevated/40 px-4 py-3">{option}</li>)}
        </ul>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-bold text-white">Summary</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            {lesson.summary.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Card>
        <Card>
          <h2 className="font-bold text-white">Quiz and flashcards</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">This lesson includes {lesson.quiz.length} quiz question(s) and {lesson.flashcards.length} spaced-repetition card(s).</p>
        </Card>
      </section>

      <Card>
        <h2 className="font-bold text-white">References</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          {lesson.references.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </Card>
    </article>
  </AppShell>
}
