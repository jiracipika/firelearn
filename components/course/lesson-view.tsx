'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ClipboardCheck, ExternalLink, PlayCircle, ShieldCheck } from 'lucide-react'
import type { Course, Lesson } from '@/types/learning'
import { useSupabaseProgress } from '@/hooks/use-supabase-progress'
import { getBrowserStorage } from '@/services/local-persistence'
import { createOfflineProgressRepository } from '@/services/offline-progress'
import { AppShell } from '@/components/layout/app-shell'
import { ContentBlock } from '@/components/course/content-block'
import { InteractiveKnowledgeCheck } from '@/components/course/interactive-knowledge-check'
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

  // Compute prev/next lessons for navigation
  const allLessonsInCourse = course.modules.flatMap((module) => module.lessons)
  const currentIndex = allLessonsInCourse.findIndex((item) => item.id === lesson.id)
  const prevLesson = currentIndex > 0 ? allLessonsInCourse[currentIndex - 1] : undefined
  const nextLesson = currentIndex >= 0 && currentIndex < allLessonsInCourse.length - 1 ? allLessonsInCourse[currentIndex + 1] : undefined

  return <AppShell>
    <article className="mx-auto max-w-4xl space-y-6">
      <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-white">
        <ArrowLeft size={16} /> {course.title}
      </Link>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.4fr]">
        <Card className="relative overflow-hidden border-border-bright p-6 md:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-info" />
          <Badge>{lesson.difficulty} · {lesson.estimatedMinutes} min</Badge>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em] text-white md:text-5xl">{lesson.title}</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">{lesson.videoPlaceholder}</p>
          <Progress value={progress} className="mt-5" />
          <p className="mt-2 text-xs text-muted">{progress}% complete</p>
        </Card>

        <Card className="space-y-3 border-border-bright">
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
            : <Button size="sm" disabled={completed} onClick={() => {
              // Save to localStorage as offline backup
              const storage = getBrowserStorage()
              if (storage) {
                createOfflineProgressRepository(storage).completeLesson({ lessonId: lesson.id, courseId: course.id, xpAwarded })
              }
              completeLesson({ lessonId: lesson.id, courseId: course.id, xpAwarded })
            }}>{completed ? 'Completed' : `Mark complete · ${xpAwarded} XP`}</Button>
          }
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Watch before starting</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">Embedded tutorial queue</h2>
          </div>
          <span className="rounded-md border border-info/30 bg-info/10 px-3 py-1 text-xs font-semibold text-info">{lesson.videos.length} YouTube videos</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {lesson.videos.map((video) => (
            <div key={video.id} className="overflow-hidden rounded-lg border border-border bg-card/90">
              <div className="aspect-video bg-black">
                <iframe
                  className="h-full w-full"
                  src={video.embedUrl}
                  title={video.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="flex min-h-20 items-start justify-between gap-3 p-3">
                <div>
                  <p className="text-sm font-semibold leading-snug text-white">{video.title}</p>
                  <p className="mt-1 text-xs text-muted">YouTube tutorial</p>
                </div>
                <a className="rounded-md border border-border bg-elevated p-2 text-muted-foreground transition hover:border-border-bright hover:text-white" href={video.url} target="_blank" rel="noreferrer" aria-label={`Open ${video.title} on YouTube`}>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
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

      <Card className="border-info/25 bg-info/8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <PlayCircle className="mt-0.5 shrink-0 text-info" size={20} />
            <div>
              <h2 className="font-bold text-white">Start the lesson rep</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Watch the tutorials, scan the objectives, then use the knowledge check and mixed quiz bank to test the topic.</p>
            </div>
          </div>
          <Badge className="border-info/25 bg-info/10 text-info">{lesson.imageAlt}</Badge>
        </div>
      </Card>

      <div className="grid gap-4">
        {lesson.content.map((block, index) => <ContentBlock key={`${block.type}-${index}`} block={block} />)}
      </div>

      <Card>
        <h2 className="font-bold text-white">Knowledge check</h2>
        <InteractiveKnowledgeCheck question={lesson.knowledgeCheck} />
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-bold text-white">Summary</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            {lesson.summary.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Card>
        <Card className="space-y-3">
          <h2 className="font-bold text-white">Quiz and flashcards</h2>
          <p className="text-sm leading-6 text-muted-foreground">This lesson includes {lesson.quiz.length} quiz question(s) and {lesson.flashcards.length} spaced-repetition card(s).</p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/quiz?course=${course.slug}&lesson=${lesson.slug}`}><Button variant="outline" size="sm">Practice this lesson</Button></Link>
            <Link href={`/flashcards?course=${course.slug}&lesson=${lesson.slug}`}><Button variant="outline" size="sm">Review lesson cards</Button></Link>
          </div>
        </Card>
      </section>

      <Card>
        <h2 className="font-bold text-white">References</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          {lesson.references.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </Card>

      {(prevLesson || nextLesson) && (
        <nav className="grid gap-4 sm:grid-cols-2">
          {prevLesson && (
            <Link href={`/courses/${course.slug}/${prevLesson.slug}`} className="group">
              <Card className="flex items-center gap-3 transition hover:border-primary/30">
                <ArrowLeft size={20} className="text-muted-foreground transition group-hover:text-primary" />
                <div>
                  <p className="text-xs text-muted">Previous lesson</p>
                  <p className="text-sm font-semibold text-white">{prevLesson.title}</p>
                </div>
              </Card>
            </Link>
          )}
          {nextLesson && (
            <Link href={`/courses/${course.slug}/${nextLesson.slug}`} className="group sm:text-right">
              <Card className="flex items-center gap-3 transition hover:border-primary/30 sm:flex-row-reverse">
                <ArrowLeft size={20} className="rotate-180 text-muted-foreground transition group-hover:text-primary" />
                <div>
                  <p className="text-xs text-muted">Next lesson</p>
                  <p className="text-sm font-semibold text-white">{nextLesson.title}</p>
                </div>
              </Card>
            </Link>
          )}
        </nav>
      )}
    </article>
  </AppShell>
}
