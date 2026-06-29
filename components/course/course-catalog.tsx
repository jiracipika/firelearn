'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import { categories } from '@/data/categories'
import { academyCourses } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { CourseCard } from '@/components/course/course-card'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function CourseCatalog() {
  const [query, setQuery] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null)
  const normalized = query.trim().toLowerCase()

  const courses = academyCourses.filter((course) => {
    const matchesText = [course.title, course.description, course.categoryId].some((value) => value.toLowerCase().includes(normalized))
    const matchesCategory = !activeCategory || course.categoryId === activeCategory
    return matchesText && matchesCategory
  })

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    academyCourses.forEach((course) => { counts[course.categoryId] = (counts[course.categoryId] ?? 0) + 1 })
    return counts
  }, [])

  return <AppShell><div className="space-y-8">
    <section className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Academy</p>
      <h1 className="text-4xl font-bold tracking-[-0.03em] md:text-5xl">Firefighter course catalog</h1>
      <p className="max-w-2xl text-lg leading-7 text-muted-foreground">A scalable academy mapped to NFPA 1001 and 472 certification domains. Category, course, module, lesson, quiz, and flashcards.</p>
    </section>

    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
      <Input className="pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses, disciplines, tactics..." aria-label="Search courses" />
    </div>

    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setActiveCategory(null)}
        className={cn('rounded-lg border px-3 py-1.5 text-xs font-medium transition', !activeCategory ? 'border-primary/40 bg-primary/10 text-red-200' : 'border-border bg-elevated/40 text-muted-foreground hover:text-white')}
      >
        All ({academyCourses.length})
      </button>
      {categories.filter((cat) => (categoryCounts[cat.id] ?? 0) > 0).slice(0, 16).map((category) => (
        <button
          key={category.id}
          onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
          className={cn('rounded-lg border px-3 py-1.5 text-xs font-medium transition', activeCategory === category.id ? 'border-primary/40 bg-primary/10 text-red-200' : 'border-border bg-elevated/40 text-muted-foreground hover:text-white')}
        >
          {category.title}
        </button>
      ))}
    </div>

    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => <CourseCard key={course.id} course={course} />)}
    </section>

    {courses.length === 0 && (
      <Card className="py-12 text-center text-muted-foreground">No courses match your search.</Card>
    )}
  </div></AppShell>
}
