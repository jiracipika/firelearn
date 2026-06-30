'use client'

import Link from 'next/link'
import { Award, BookOpen, CalendarDays, Flame } from 'lucide-react'
import type { Course } from '@/types/learning'
import { educationalDisclaimer, getCategoryTitle } from '@/data/academy'
import { getCourseStats } from '@/lib/academy-selectors'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function CourseCertificate({ course }: { course: Course }) {
  const stats = getCourseStats(course)
  return <AppShell>
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href={`/courses/${course.slug}`} className="text-sm font-semibold text-primary hover:opacity-80">← Back to course</Link>
      <Card className="relative overflow-hidden border-border-bright p-8 text-center md:p-12 print:border-black print:bg-white print:text-black">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-primary via-accent to-info" />
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10">
          <Award size={42} className="text-primary" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-red-200 print:text-black">Certificate of completion</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-white md:text-6xl print:text-black">{course.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground print:text-black">This certificate records completion of the FireLearn study path for {getCategoryTitle(course.categoryId)}. It is a study record, not an official certification or replacement for instructor-led practical evaluation.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-elevated/40 p-4 print:border-black print:bg-white">
            <BookOpen className="mx-auto text-primary" size={20} />
            <p className="mt-2 text-2xl font-bold text-white print:text-black">{stats.lessonCount}</p>
            <p className="text-xs text-muted-foreground print:text-black">Lessons</p>
          </div>
          <div className="rounded-xl border border-border bg-elevated/40 p-4 print:border-black print:bg-white">
            <Flame className="mx-auto text-primary" size={20} />
            <p className="mt-2 text-2xl font-bold text-white print:text-black">{course.xp}</p>
            <p className="text-xs text-muted-foreground print:text-black">XP path value</p>
          </div>
          <div className="rounded-xl border border-border bg-elevated/40 p-4 print:border-black print:bg-white">
            <CalendarDays className="mx-auto text-primary" size={20} />
            <p className="mt-2 text-2xl font-bold text-white print:text-black">{new Date().toLocaleDateString()}</p>
            <p className="text-xs text-muted-foreground print:text-black">Generated</p>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-xs leading-5 text-muted-foreground print:text-black">{educationalDisclaimer}</p>
        <Button className="mt-8 print:hidden" onClick={() => window.print()}>Print / save PDF</Button>
      </Card>
    </div>
  </AppShell>
}
