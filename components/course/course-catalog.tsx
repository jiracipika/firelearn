'use client'

import * as React from 'react'
import { categories } from '@/data/categories'
import { academyCourses } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { CourseCard } from '@/components/course/course-card'
import { Input } from '@/components/ui/input'

export function CourseCatalog() {
  const [query, setQuery] = React.useState('')
  const normalized = query.trim().toLowerCase()
  const courses = academyCourses.filter((course) => [course.title, course.description, course.categoryId].some((value) => value.toLowerCase().includes(normalized)))

  return <AppShell><div className="space-y-8">
    <div className="max-w-3xl space-y-3"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-200">Academy</p><h1 className="text-4xl font-semibold tracking-tight">Firefighter course catalog</h1><p className="text-muted">The data model already supports category → course → module → lesson, so the catalog can grow to thousands of lessons without changing component contracts.</p></div>
    <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses, lessons, flashcards, topics..." aria-label="Search courses" />
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{categories.map((category) => <div key={category.id} className="rounded-2xl border border-border bg-white/[0.03] p-4"><p className="font-medium">{category.title}</p><p className="mt-2 text-sm text-muted">{category.description}</p></div>)}</section>
    <section className="grid gap-4 md:grid-cols-3">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</section>
  </div></AppShell>
}
