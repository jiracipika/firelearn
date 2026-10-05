'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { categories } from '@/data/categories'
import { academyCourses } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { CourseCard } from '@/components/course/course-card'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { searchCourseCatalog } from '@/lib/search'
import { cn } from '@/lib/utils'
import { useOfflineProgress } from '@/hooks/use-offline-progress'
import { useSupabaseProgress } from '@/hooks/use-supabase-progress'
import { mergeCompletedLessonIds } from '@/services/progress-merge'

export function CourseCatalog() {
  const localProgress = useOfflineProgress()
  const savedProgress = useSupabaseProgress()
  const completedLessonIds = mergeCompletedLessonIds(savedProgress.completedLessonIds, localProgress.learnerState.completedLessonIds)
  const [query, setQuery] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const normalized = query.trim()

  const catalogMatches = React.useMemo(() => searchCourseCatalog(query), [query])
  const visibleMatches = catalogMatches.filter(({ course }) => !activeCategory || course.categoryId === activeCategory)
  const courses = visibleMatches.map(({ course }) => course)

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    academyCourses.forEach((course) => { counts[course.categoryId] = (counts[course.categoryId] ?? 0) + 1 })
    return counts
  }, [])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if (typing) return
      if (event.key === '/') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return <AppShell><div className="fl-catalog space-y-8">
    <section>
      <p className="fl-kicker">The learning library</p>
      <h1 className="fl-catalog-title mt-2">Find something to work on.</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Browse {academyCourses.length} courses, from the fundamentals to company-officer study. Start wherever feels useful.</p>
    </section>

    <div className="fl-catalog-search relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
      <Input ref={searchInputRef} className="pl-11 pr-16" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “smoke”, “hose”, or “leadership”" aria-label="Search courses" />
      <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {query ? (
          <button
            type="button"
            onClick={() => { setQuery(''); searchInputRef.current?.focus() }}
            className="pointer-events-auto inline-flex size-11 items-center justify-center rounded text-muted transition hover:bg-elevated hover:text-white"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        ) : (
          <kbd className="hidden rounded border border-border bg-elevated/60 px-1.5 py-0.5 text-[10px] text-muted sm:inline-block">/</kbd>
        )}
      </div>
    </div>

    <div className="fl-catalog-filters flex flex-wrap gap-2" role="group" aria-label="Filter courses by topic">
      <button
        aria-pressed={!activeCategory}
        onClick={() => setActiveCategory(null)}
        className={cn('rounded-md border px-3 py-1.5 text-xs font-medium transition', !activeCategory ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-elevated/40 text-muted-foreground hover:text-white')}
      >
        All ({academyCourses.length})
      </button>
      {categories.filter((cat) => (categoryCounts[cat.id] ?? 0) > 0).slice(0, 16).map((category) => (
        <button
          key={category.id}
          aria-pressed={activeCategory === category.id}
          onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
          className={cn('rounded-md border px-3 py-1.5 text-xs font-medium transition', activeCategory === category.id ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-elevated/40 text-muted-foreground hover:text-white')}
        >
          {category.title}
        </button>
      ))}
    </div>

    <p className="text-sm text-muted-foreground" role="status" aria-live="polite">{courses.length} {courses.length === 1 ? 'course' : 'courses'}{normalized ? ` matching “${normalized}”` : activeCategory ? ' in this topic' : ' to explore'}</p>

    <section className="fl-catalog-grid grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {visibleMatches.map((match) => (
        <div key={match.course.id} className="space-y-2">
          <CourseCard course={match.course} completedLessonIds={completedLessonIds} />
          {normalized && match.topMatches.length > 0 && (
            <div className="rounded-xl border border-border bg-card/50 px-3 py-2 text-xs text-muted-foreground">
              <p className="font-semibold text-primary">Best match</p>
              <p className="mt-1 line-clamp-2 text-white">{match.topMatches[0].title}</p>
              <p className="mt-1 capitalize text-muted">{match.matchedTypes.join(', ').replace(/-/g, ' ')} · {match.matchCount} match{match.matchCount === 1 ? '' : 'es'}</p>
            </div>
          )}
        </div>
      ))}
    </section>

    {courses.length === 0 ? (
      <Card className="py-12 text-center text-muted-foreground">
        <h2 className="font-semibold text-white">No courses found this time.</h2><p className="mt-2 text-sm">Try a different word or clear the topic filter.</p>
        {(query || activeCategory) && (
          <button
            type="button"
            onClick={() => { setQuery(''); setActiveCategory(null); searchInputRef.current?.focus() }}
            className="mt-2 inline-block text-sm font-semibold text-primary hover:opacity-80"
          >
            Clear filters
          </button>
        )}
      </Card>
    ) : (
      <p className="text-center text-xs text-muted">
        Showing {courses.length} of {academyCourses.length} courses
      </p>
    )}
  </div></AppShell>
}
