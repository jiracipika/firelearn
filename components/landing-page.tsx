import Link from 'next/link'
import { ArrowRight, BookOpenCheck, Brain, CheckCircle2, Flame, Gauge, Radio, ShieldAlert, Sparkles, Trophy } from 'lucide-react'
import { academyCourses } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const pillars = [
  { title: 'Academy paths', body: 'Progress from fundamentals to scenario-heavy fireground judgment with a scalable course model mapped to NFPA 1001 and 472.', icon: BookOpenCheck },
  { title: 'Exam-grade quizzes', body: 'Practice mode, exam mode, explanations, weak-topic detection, and realistic incident prompts.', icon: Brain },
  { title: 'Spaced repetition', body: 'SM-2 style scheduling keeps SCBA, mayday, codes, and tactics fresh between calls.', icon: Flame },
  { title: 'Progress signals', body: 'XP, completion, streaks, and review queues create accountability without LMS clutter.', icon: Trophy },
]

const stats = [
  ['29', 'Disciplines'],
  [String(academyCourses.length), 'Courses'],
  ['120+', 'Lessons'],
  ['SM-2', 'Review engine'],
] as const

export function LandingPage() {
  const featured = academyCourses[0]
  return <AppShell fullBleed>
    <section className="relative isolate overflow-hidden px-4 py-20 sm:px-6 lg:py-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgb(255_59_34_/_0.18),transparent)]" />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="animate-fade-in-up space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-bright bg-elevated/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-red-200">
            <Sparkles size={13} /> Firefighter training, rebuilt
          </div>
          <h1 className="max-w-5xl text-5xl font-bold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Train smarter for the <span className="bg-gradient-to-r from-red-400 via-primary to-accent bg-clip-text text-transparent">fireground.</span>
          </h1>
          <p className="max-w-2xl text-lg leading-7 text-muted-foreground sm:text-xl sm:leading-8">
            FireLearn combines structured courses, exam-grade quizzes, spaced-repetition flashcards, and Supabase-backed progress into one modern academy for firefighters.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button size="lg">Start learning <ArrowRight size={18} /></Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg">Browse academy</Button>
            </Link>
          </div>
          <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-border bg-card/60 p-4">
                <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
                <p className="mt-1 text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="animate-fade-in-up overflow-hidden p-0" >
          <div className="border-b border-border bg-elevated/50 px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white">Today&apos;s firehouse session</p>
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Live path</span>
            </div>
          </div>
          <div className="space-y-5 p-5">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/12 to-transparent p-5">
              <p className="text-sm font-medium text-red-200">Continue course</p>
              <h2 className="mt-2 text-xl font-bold text-white">{featured?.title ?? 'Fire behaviour foundations'}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Smoke reading, SCBA checks, incident command, and mayday decision points.</p>
              <Progress value={featured?.progressPercent ?? 34} className="mt-5" />
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span>{featured?.progressPercent ?? 34}% complete</span>
                <span>{featured?.estimatedMinutes ?? 0} min</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Due cards', value: '18', icon: Flame, tone: 'text-red-300' },
                { label: 'Weak topic', value: 'SCBA', icon: ShieldAlert, tone: 'text-amber-300' },
                { label: 'Goal', value: '25m', icon: Gauge, tone: 'text-green-300' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-elevated/40 p-4">
                  <item.icon className={item.tone} size={18} />
                  <p className="mt-2 text-lg font-bold text-white">{item.value}</p>
                  <p className="text-xs text-muted">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-elevated/40 p-4">
              <div className="flex items-start gap-3">
                <Radio className="mt-0.5 shrink-0 text-amber-300" size={16} />
                <div>
                  <p className="text-sm font-medium text-white">Educational support only</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Reinforces official training, SOPs, and instructor-led certification. Not a replacement.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-20 sm:px-6 md:grid-cols-4">
      {pillars.map((pillar) => (
        <Card key={pillar.title} className="group transition duration-200 hover:-translate-y-1 hover:border-primary/30">
          <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <pillar.icon className="text-primary" size={22} aria-hidden />
          </div>
          <h2 className="font-bold text-white">{pillar.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.body}</p>
        </Card>
      ))}
    </section>

    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <Card className="grid gap-6 overflow-hidden bg-gradient-to-br from-card via-card to-card p-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Ready for the next rep?</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">Build mastery before the alarm drops.</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">Jump into the dashboard, run mixed practice, or clear today&apos;s review queue.</p>
        </div>
        <Link href="/dashboard">
          <Button size="lg">Open dashboard <CheckCircle2 size={18} /></Button>
        </Link>
      </Card>
    </section>
  </AppShell>
}
