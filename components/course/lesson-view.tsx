'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ClipboardCheck, ExternalLink, ShieldCheck } from 'lucide-react'
import type { Course, Lesson } from '@/types/learning'
import { useSupabaseProgress } from '@/hooks/use-supabase-progress'
import { useOfflineProgress } from '@/hooks/use-offline-progress'
import { getBrowserStorage } from '@/services/local-persistence'
import { createOfflineProgressRepository } from '@/services/offline-progress'
import { getLessonXpAward } from '@/services/lesson-xp'
import { getLessonPracticeHref, getLessonSequence } from '@/services/lesson-navigation'
import { lessonJsonLd } from '@/lib/json-ld'
import { AppShell } from '@/components/layout/app-shell'
import { JsonLd } from '@/components/seo/json-ld'
import { ContentBlock } from '@/components/course/content-block'
import { VideoFacade } from '@/components/course/video-facade'
import { InteractiveKnowledgeCheck } from '@/components/course/interactive-knowledge-check'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollProgress } from '@/components/ui/scroll-progress'

function lessonProgressPercent(completed: boolean) {
  if (completed) return 100
  return 0
}

export function LessonView({ course, lesson }: { course: Course; lesson: Lesson }) {
  const { completedLessonIds, completeLesson, available, authenticated, loading, signIn, error } = useSupabaseProgress()
  const offlineProgress = useOfflineProgress()
  const completed = completedLessonIds.includes(lesson.id) || offlineProgress.learnerState.completedLessonIds.includes(lesson.id)
  const progress = lessonProgressPercent(completed)
  const xpAwarded = getLessonXpAward(course)

  // Compute prev/next lessons for navigation
  const sequence = getLessonSequence(course, lesson.id)
  const prevLesson = sequence.previous
  const nextLesson = sequence.next

  function markComplete() {
    const storage = getBrowserStorage()
    let clientMutationId: string | undefined
    if (storage) {
      clientMutationId = createOfflineProgressRepository(storage).completeLesson({ lessonId: lesson.id, courseId: course.id, xpAwarded })
      offlineProgress.refresh()
    }
    if (authenticated) {
      void completeLesson({ lessonId: lesson.id, courseId: course.id, xpAwarded }, clientMutationId)
    }
  }

  return <AppShell>
    <JsonLd data={lessonJsonLd(course, lesson)} />
    <ScrollProgress />
    <article className="fl-lesson mx-auto max-w-4xl space-y-6">
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
            {completed ? 'Lesson completed. Your progress is saved on this device.' : 'Your progress saves here, even if you’re offline.'}
          </p>
          {error && <p className="text-xs leading-5 text-red-300" role="status">Cloud save couldn’t connect. Your progress is saved on this device.</p>}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={completed} onClick={markComplete}>{completed ? 'Completed' : 'Mark as complete'}</Button>
            {available && !authenticated && <Button variant="outline" size="sm" disabled={loading} onClick={signIn}>{loading ? 'Connecting…' : 'Connect cloud save'}</Button>}
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Watch and learn</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">Video walkthroughs</h2>
          </div>
          <span className="rounded-md border border-info/30 bg-info/10 px-3 py-1 text-xs font-semibold text-info">{lesson.videos.length} YouTube videos</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {lesson.videos.map((video) => (
            <div key={video.id} className="overflow-hidden rounded-lg border border-border bg-card/90">
              <VideoFacade video={video} />
              <div className="flex min-h-20 items-start justify-between gap-3 p-3">
                <div>
                  <p className="text-sm font-semibold leading-snug text-white">{video.title}</p>
                  <p className="mt-1 text-xs text-muted">YouTube · select to watch</p>
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

      <div className="fl-lesson-copy space-y-6">
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
          <p className="text-sm leading-6 text-muted-foreground">Practice with {lesson.quiz.length} questions or review {lesson.flashcards.length} flashcards from this lesson.</p>
          <div className="flex flex-wrap gap-2">
            <Link href={getLessonPracticeHref('quiz', course, lesson)}><Button variant="outline" size="sm">Practice this lesson</Button></Link>
            <Link href={getLessonPracticeHref('flashcards', course, lesson)}><Button variant="outline" size="sm">Review lesson cards</Button></Link>
          </div>
        </Card>
      </section>

      <Card>
        <h2 className="font-bold text-white">References</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          {lesson.references.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div><h2 className="font-semibold">{completed ? 'Lesson complete' : 'Finished reading?'}</h2><p className="mt-1 text-sm text-muted-foreground">{completed ? 'You can come back to this lesson anytime.' : 'Save your progress before moving to the next lesson.'}</p></div>
        <Button disabled={completed} onClick={markComplete}>{completed ? 'Completed' : 'Mark as complete'}</Button>
      </Card>

      {(prevLesson || nextLesson) && (
        <nav aria-label="Lesson navigation" className="grid gap-4 sm:grid-cols-2">
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
