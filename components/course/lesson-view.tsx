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
  const { completedLessonIds, completeLesson, available, authenticated, signIn, error } = useSupabaseProgress()
  const completed = completedLessonIds.includes(lesson.id)
  const progress = lessonProgressPercent(completed, lesson)
  const xpAwarded = Math.max(25, Math.round(course.xp / Math.max(1, course.modules.flatMap((module) => module.lessons).length)))

  return <AppShell><article className="mx-auto max-w-5xl space-y-7">
    <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-white"><ArrowLeft size={16} /> {course.title}</Link>
    <section className="grid gap-6 lg:grid-cols-[1fr_0.42fr]">
      <Card className="relative overflow-hidden p-7"><div className="absolute right-0 top-0 size-52 rounded-full bg-primary/20 blur-3xl" /><Badge>{lesson.difficulty} · {lesson.estimatedMinutes} min</Badge><h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] md:text-6xl">{lesson.title}</h1><p className="mt-4 text-lg leading-8 text-muted">{lesson.videoPlaceholder}</p><Progress value={progress} className="mt-6" /></Card>
      <Card className="space-y-4"><div className="flex items-center gap-2"><ShieldCheck className="text-red-200" /><h2 className="font-semibold">Supabase progress</h2></div><p className="text-sm leading-6 text-muted">{!available ? 'Supabase environment variables are not available in this deployment.' : !authenticated ? 'Sign in anonymously to save this lesson to Supabase.' : completed ? 'Completed and saved in Supabase.' : 'Save this lesson completion directly to Supabase.'}</p>{error && <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}{!authenticated ? <Button disabled={!available} onClick={signIn}>Sign in to save</Button> : <Button disabled={completed} onClick={() => completeLesson({ lessonId: lesson.id, courseId: course.id, xpAwarded })}>{completed ? 'Completed' : `Mark complete · ${xpAwarded} XP`}</Button>}</Card>
    </section>
    <Card className="grid gap-6 md:grid-cols-2"><div><h2 className="flex items-center gap-2 font-semibold"><ClipboardCheck size={18} className="text-red-200" /> Objectives</h2><ul className="mt-4 space-y-3 text-sm text-muted">{lesson.objectives.map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />{item}</li>)}</ul></div><div><h2 className="font-semibold">Prerequisites</h2><ul className="mt-4 space-y-3 text-sm text-muted">{lesson.prerequisites.map((item) => <li key={item} className="rounded-xl border border-white/[0.08] bg-black/20 p-3">{item}</li>)}</ul></div></Card>
    <Card className="flex min-h-64 items-center justify-center border-dashed bg-black/20 text-muted"><PlayCircle className="mr-2 text-red-200" /> Video placeholder · {lesson.imageAlt}</Card>
    <div className="grid gap-5">{lesson.content.map((block, index) => <ContentBlock key={`${block.type}-${index}`} block={block} />)}</div>
    <Card><h2 className="font-semibold">Knowledge check</h2><p className="mt-2 text-muted">{lesson.knowledgeCheck.prompt}</p><ul className="mt-4 grid gap-2 text-sm text-muted">{lesson.knowledgeCheck.options.map((option) => <li key={option} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">{option}</li>)}</ul></Card>
    <section className="grid gap-5 md:grid-cols-2"><Card><h2 className="font-semibold">Summary</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-muted">{lesson.summary.map((item) => <li key={item}>{item}</li>)}</ul></Card><Card><h2 className="font-semibold">Quiz and flashcards</h2><p className="mt-2 text-muted">This lesson includes {lesson.quiz.length} quiz question(s) and {lesson.flashcards.length} spaced-repetition card(s).</p></Card></section>
    <Card><h2 className="font-semibold">References</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-muted">{lesson.references.map((item) => <li key={item}>{item}</li>)}</ul></Card>
  </article></AppShell>
}
