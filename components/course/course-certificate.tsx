'use client'

import * as React from 'react'
import Link from 'next/link'
import { Award, BookOpen, CalendarDays, Flame, Pencil, UserCircle } from 'lucide-react'
import type { Course } from '@/types/learning'
import { educationalDisclaimer, getCategoryTitle } from '@/data/academy'
import { getCourseStats } from '@/lib/academy-selectors'
import { getBrowserStorage, loadLearnerName, saveLearnerName } from '@/services/local-persistence'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function CourseCertificate({ course }: { course: Course }) {
  const stats = getCourseStats(course)
  const [learnerName, setLearnerName] = React.useState<string | null>(null)
  const [editingName, setEditingName] = React.useState(false)
  const [nameDraft, setNameDraft] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const storage = getBrowserStorage()
    if (!storage) return
    window.queueMicrotask(() => setLearnerName(loadLearnerName(storage)))
  }, [])

  React.useEffect(() => {
    if (editingName && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingName])

  function startEditing() {
    setNameDraft(learnerName ?? '')
    setEditingName(true)
  }

  function commitName() {
    const storage = getBrowserStorage()
    if (!storage) {
      setEditingName(false)
      return
    }
    const clean = nameDraft.trim()
    if (clean) {
      saveLearnerName(storage, clean)
      setLearnerName(clean)
    } else {
      saveLearnerName(storage, '')
      setLearnerName(null)
    }
    setEditingName(false)
  }

  function cancelEditing() {
    setEditingName(false)
    setNameDraft(learnerName ?? '')
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitName()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancelEditing()
    }
  }

  return <AppShell>
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href={`/courses/${course.slug}`} className="text-sm font-semibold text-primary hover:opacity-80">← Back to course</Link>
      <Card className="relative overflow-hidden border-border-bright p-8 text-center md:p-12 print:border-black print:bg-white print:text-black">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-primary via-accent to-info" />
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10">
          <Award size={42} className="text-primary" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-red-200 print:text-black">Certificate of completion</p>

        {/* Learner name — editable, hidden during print editing UI */}
        <div className="mt-4 print:text-black">
          {editingName ? (
            <div className="print:hidden">
              <input
                ref={inputRef}
                type="text"
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                onKeyDown={onKeyDown}
                onBlur={commitName}
                maxLength={80}
                placeholder="Enter your name"
                aria-label="Your name for the certificate"
                className="mx-auto block max-w-md rounded-xl border border-primary/40 bg-elevated/60 px-4 py-2 text-center text-lg font-semibold text-white outline-none ring-2 ring-primary/20 focus:ring-primary/40"
              />
              <p className="mt-2 text-xs text-muted-foreground">Press Enter to save · Esc to cancel · saved on this device</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="group mx-auto flex items-center gap-2 rounded-xl px-3 py-1 transition hover:bg-elevated/50 print:cursor-default"
              aria-label={learnerName ? 'Edit your name' : 'Add your name to this certificate'}
            >
              <UserCircle size={20} className="text-muted-foreground" aria-hidden />
              <span className="text-xl font-semibold text-white print:text-black">
                {learnerName ?? 'Add your name'}
              </span>
              <Pencil size={14} className="text-muted-foreground opacity-0 transition group-hover:opacity-100 print:hidden" aria-hidden />
            </button>
          )}
        </div>

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
