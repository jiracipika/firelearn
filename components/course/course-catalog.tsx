'use client'

import * as React from 'react'
import { Search, ShieldCheck } from 'lucide-react'
import { categories } from '@/data/categories'
import { academyCourses } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { CourseCard } from '@/components/course/course-card'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export function CourseCatalog() {
  const [query, setQuery] = React.useState('')
  const normalized = query.trim().toLowerCase()
  const courses = academyCourses.filter((course) => [course.title, course.description, course.categoryId].some((value) => value.toLowerCase().includes(normalized)))

  return <AppShell><div className="space-y-8">
    <section className="grid gap-6 lg:grid-cols-[1fr_0.45fr] lg:items-end"><div className="max-w-3xl space-y-4"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-200">Academy</p><h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Firefighter course catalog</h1><p className="text-lg leading-8 text-muted">A scalable academy structure for thousands of future lessons: category → course → module → lesson → quiz → flashcards.</p></div><Card className="bg-primary/10"><ShieldCheck className="mb-3 text-red-200" /><p className="font-semibold">Not an LMS. A training engine.</p><p className="mt-2 text-sm leading-6 text-muted">Fast search, daily reps, and fireground-focused mastery without school software clutter.</p></Card></section>
    <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} /><Input className="pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses, disciplines, tactics, standards..." aria-label="Search courses" /></div>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{categories.slice(0, 12).map((category) => <div key={category.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-primary/25 hover:bg-white/[0.055]"><p className="font-medium text-white">{category.title}</p><p className="mt-2 text-sm leading-6 text-muted">{category.description}</p></div>)}</section>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</section>
  </div></AppShell>
}
