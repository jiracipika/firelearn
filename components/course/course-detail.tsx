'use client'

import Link from 'next/link'
import { ArrowRight, Award, BookOpen, Brain, CheckCircle2, Clock, Cloud, CloudOff, Layers, LibraryBig, PlayCircle } from 'lucide-react'
import type { Course } from '@/types/learning'
import { getCategoryTitle } from '@/data/academy'
import { getCourseStats } from '@/lib/academy-selectors'
import { courseJsonLd } from '@/lib/json-ld'
import { useCourseProgress } from '@/hooks/use-course-progress'
import { AppShell } from '@/components/layout/app-shell'
import { JsonLd } from '@/components/seo/json-ld'
import { LessonCard } from '@/components/course/lesson-card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export function CourseDetail({ course }: { course: Course }) {
  const stats = getCourseStats(course)
  const learnerProgress = useCourseProgress(course)
  const completedSet = new Set(learnerProgress.completedLessonIds)
  const videoCount = course.modules.reduce((total, courseModule) => total + courseModule.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.videos.length, 0), 0)
  const statItems = [
    { label: 'Minutes', value: course.estimatedMinutes, icon: Clock },
    { label: 'Modules', value: stats.moduleCount, icon: Layers },
    { label: 'Lessons', value: stats.lessonCount, icon: BookOpen },
    { label: 'Videos', value: videoCount, icon: PlayCircle },
    { label: 'Questions', value: stats.quizQuestionCount, icon: Brain },
    { label: 'Cards', value: stats.flashcardCount, icon: LibraryBig },
  ]
  const nextHref = learnerProgress.nextLesson
    ? `/courses/${course.slug}/${learnerProgress.nextLesson.slug}`
    : `/courses/${course.slug}/certificate`
  const nextLabel = learnerProgress.isComplete
    ? 'View completion certificate'
    : learnerProgress.completedCount > 0
      ? `Continue: ${learnerProgress.nextLesson?.title ?? 'course'}`
      : 'Start first lesson'

  let syncMessage = 'Progress is saved on this device.'
  let SyncIcon = CloudOff
  if (learnerProgress.loading) {
    syncMessage = 'Loading saved progress…'
  } else if (learnerProgress.authenticated) {
    SyncIcon = Cloud
    syncMessage = learnerProgress.syncQueueCount > 0
      ? `${learnerProgress.syncQueueCount} local ${learnerProgress.syncQueueCount === 1 ? 'change is' : 'changes are'} queued for Supabase sync.`
      : 'Progress is synced with Supabase.'
  } else if (learnerProgress.supabaseAvailable) {
    syncMessage = 'Progress is saved locally. Sign in from any lesson to sync it with Supabase.'
  }

  return <AppShell><JsonLd data={courseJsonLd(course)} /><div className="space-y-9">
    <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <Card className="relative overflow-hidden border-border-bright p-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-info" />
        <Badge>{getCategoryTitle(course.categoryId)}</Badge>
        <h1 className="mt-5 max-w-4xl text-3xl font-bold tracking-[-0.03em] md:text-5xl">{course.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-7 text-muted-foreground">{course.description}</p>

        <div className="mt-6 rounded-xl border border-border bg-elevated/35 p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Your course progress</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {learnerProgress.loading ? 'Checking this device and Supabase…' : `${learnerProgress.completedCount} of ${learnerProgress.totalCount} lessons complete`}
              </p>
            </div>
            <span className="text-2xl font-bold tabular-nums text-white">{learnerProgress.percent}%</span>
          </div>
          <Progress value={learnerProgress.percent} label={`${course.title} course progress`} className="mt-3" />
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
            <SyncIcon size={14} className="shrink-0" aria-hidden /> {syncMessage}
          </p>
          {learnerProgress.syncError && <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/8 p-2.5 text-xs text-red-200" role="status">Supabase sync issue: {learnerProgress.syncError} Your local progress remains available.</p>}
          <Link href={nextHref} className={cn(buttonVariants({ size: 'lg' }), 'mt-4 w-full sm:w-auto')}>
            {nextLabel} <ArrowRight size={17} aria-hidden />
          </Link>
        </div>
      </Card>

      <Card className="grid gap-2 border-border-bright">
        {statItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg border border-border bg-elevated/40 px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-muted-foreground"><item.icon size={16} aria-hidden /> {item.label}</span>
            <span className="font-bold text-white">{item.value}</span>
          </div>
        ))}
        {learnerProgress.isComplete ? (
          <Link href={`/courses/${course.slug}/certificate`} className={cn(buttonVariants({ variant: 'success' }), 'mt-2')}>
            <Award size={16} aria-hidden /> View earned certificate
          </Link>
        ) : (
          <div className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-border bg-elevated/40 px-4 py-3 text-center text-sm text-muted-foreground">
            <Award size={16} aria-hidden /> Certificate unlocks after every lesson
          </div>
        )}
      </Card>
    </section>

    {course.modules.map((courseModule, moduleIndex) => {
      const completedInModule = courseModule.lessons.filter((lesson) => completedSet.has(lesson.id)).length
      return (
        <section key={courseModule.id} className="space-y-4" aria-labelledby={`${courseModule.id}-title`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Module {moduleIndex + 1}</p>
              <h2 id={`${courseModule.id}-title`} className="mt-1 text-2xl font-bold tracking-tight text-white">{courseModule.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{courseModule.description}</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              {completedInModule === courseModule.lessons.length && courseModule.lessons.length > 0 && <CheckCircle2 size={15} className="text-success" aria-hidden />}
              {completedInModule}/{courseModule.lessons.length} complete
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {courseModule.lessons.map((lesson) => <LessonCard key={lesson.id} courseSlug={course.slug} lesson={lesson} completed={completedSet.has(lesson.id)} />)}
          </div>
        </section>
      )
    })}
  </div></AppShell>
}
