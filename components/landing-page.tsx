import Link from 'next/link'
import { ArrowRight, BookOpen, Brain, Check, RotateCcw } from 'lucide-react'
import { academyCourses } from '@/data/academy'
import { computeCatalogMetrics } from '@/services/catalog-metrics'
import { AppShell } from '@/components/layout/app-shell'
import { CourseCard } from '@/components/course/course-card'
import { buttonVariants } from '@/components/ui/button'

const metrics = computeCatalogMetrics(academyCourses)
const firstCourse = academyCourses[0]
const firstLesson = firstCourse?.modules[0]?.lessons[0]
const modes = [
  { title: 'Learn something new', text: 'Work through a course, with short lessons, videos, and field references.', icon: BookOpen, href: '/courses', action: 'Browse courses' },
  { title: 'Put it into practice', text: 'Try scenario questions and read the explanation behind each answer.', icon: Brain, href: '/quiz', action: 'Try a quiz' },
  { title: 'Refresh your memory', text: 'Review a few flashcards. The details you find tricky come back more often.', icon: RotateCcw, href: '/flashcards', action: 'Review cards' },
]

export function LandingPage() {
  return <AppShell fullBleed>
    <div className="fl-home">
      <section className="fl-home-hero fl-section-width" aria-labelledby="home-title">
        <div>
          <p className="fl-kicker">For the time between calls</p>
          <h1 id="home-title">A little learning.<br /><em>Every time you can.</em></h1>
          <p className="fl-home-lede">Firefighter courses, practice questions, and flashcards. Pick a topic, take your time, and come back where you left off.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/courses" className={buttonVariants({ size: 'lg' })}>Find a course <ArrowRight size={18} aria-hidden /></Link>
            <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'lg' })}>My learning</Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><Check size={16} className="text-success" aria-hidden />Start without an account. Progress saves on this device.</p>
        </div>
        {firstCourse && firstLesson && <aside className="fl-start-card" aria-label="A place to start">
          <div className="fl-start-cover" aria-hidden><BookOpen size={44} strokeWidth={1.3} /><span>THE FIELD NOTES</span></div>
          <div className="p-6 sm:p-8">
            <p className="fl-kicker">New here? Start with a lesson</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight">{firstLesson.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{firstCourse.title} · {firstLesson.estimatedMinutes} min</p>
            <Link href={`/courses/${firstCourse.slug}/${firstLesson.slug}`} className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-primary">Take a look <ArrowRight size={17} aria-hidden /></Link>
          </div>
        </aside>}
      </section>
      <div className="fl-library-strip fl-section-width" aria-label="Learning library at a glance">
        <span>A library to learn at your own pace</span>
        <span><strong>{metrics.courseCount}</strong> courses</span>
        <span><strong>{metrics.lessonCount}</strong> lessons</span>
        <span><strong>{metrics.questionCount}</strong> practice questions</span>
      </div>
      <section className="fl-section-width fl-home-section" aria-labelledby="ways-title">
        <div className="fl-section-heading"><div><p className="fl-kicker">Make it your own</p><h2 id="ways-title">What would you like to work on?</h2></div><p>A full lesson or a quick review.<br />Choose what fits your day.</p></div>
        <div className="fl-mode-grid">{modes.map((mode) => <Link key={mode.href} className="fl-mode-card" href={mode.href}>
          <span className="fl-mode-icon"><mode.icon size={24} strokeWidth={1.6} aria-hidden /></span>
          <h3>{mode.title}</h3><p>{mode.text}</p>
          <span className="fl-mode-link">{mode.action} <ArrowRight size={17} aria-hidden /></span>
        </Link>)}</div>
      </section>
      <section className="fl-section-width fl-home-section" aria-labelledby="courses-title">
        <div className="fl-section-heading"><div><p className="fl-kicker">From the library</p><h2 id="courses-title">A few places to begin</h2></div><Link href="/courses" className="fl-text-link">All {metrics.courseCount} courses <ArrowRight size={17} aria-hidden /></Link></div>
        <div className="fl-course-grid">{academyCourses.slice(0, 3).map(course => <CourseCard key={course.id} course={course} />)}</div>
      </section>
      <section className="fl-home-note fl-section-width"><BookOpen size={22} className="shrink-0 text-primary" aria-hidden /><p>Use FireLearn alongside your instructor-led training. Take notes, talk through questions with your crew, and follow your department’s procedures.</p></section>
    </div>
  </AppShell>
}
