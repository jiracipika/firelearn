import Link from 'next/link'
import { ArrowRight, BookOpenCheck, Brain, CheckCircle2, Flame, Gauge, Radio, ShieldAlert, Sparkles, Trophy } from 'lucide-react'
import { academyCourses } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const pillars = [
  { title: 'Academy paths', body: 'Progress from fundamentals to scenario-heavy fireground judgment with a scalable course model.', icon: BookOpenCheck },
  { title: 'Exam-grade quizzes', body: 'Practice mode, exam mode, explanations, weak-topic detection, and realistic incident prompts.', icon: Brain },
  { title: 'Spaced repetition', body: 'SM-2 style scheduling keeps SCBA, mayday, codes, and tactics fresh between calls.', icon: Flame },
  { title: 'Progress signals', body: 'XP, completion, streaks, and review queues create accountability without LMS clutter.', icon: Trophy },
]

const stats = [
  ['29', 'Disciplines'],
  [String(academyCourses.length), 'Courses'],
  ['7', 'Question types'],
  ['SM-2', 'Review engine'],
] as const

export function LandingPage() {
  const featured = academyCourses[0]
  return <AppShell fullBleed>
    <section className="relative isolate overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_68%_20%,rgb(255_59_34_/_0.22),transparent_28rem)]" />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-red-100"><Sparkles size={14} /> Firefighter training, rebuilt</div>
          <div className="space-y-5">
            <h1 className="max-w-5xl text-5xl font-semibold tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">Train smarter for the <span className="bg-gradient-to-r from-red-300 via-primary to-accent bg-clip-text text-transparent">fireground.</span></h1>
            <p className="max-w-2xl text-lg leading-8 text-muted sm:text-xl">FireLearn combines structured courses, fast quizzes, spaced-repetition flashcards, and Supabase-backed progress into one modern academy for firefighters.</p>
          </div>
          <div className="flex flex-wrap gap-3"><Link href="/dashboard"><Button size="lg">Start learning <ArrowRight size={18} /></Button></Link><Link href="/courses"><Button variant="outline" size="lg">Browse academy</Button></Link></div>
          <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">{stats.map(([value, label]) => <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4"><p className="text-2xl font-semibold tracking-tight text-white">{value}</p><p className="mt-1 text-xs text-muted">{label}</p></div>)}</div>
        </div>
        <Card className="relative overflow-hidden p-0">
          <div className="border-b border-white/[0.08] bg-white/[0.035] px-5 py-4"><div className="flex items-center justify-between"><p className="font-semibold">Today&apos;s firehouse session</p><span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-green-200">Live path</span></div></div>
          <div className="space-y-5 p-5">
            <div className="rounded-[1.2rem] border border-primary/20 bg-gradient-to-br from-primary/18 to-accent/8 p-5">
              <p className="text-sm text-red-100">Continue course</p>
              <h2 className="mt-2 text-2xl font-semibold">{featured?.title ?? 'Fire behaviour foundations'}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">Smoke reading, SCBA checks, incident command, and mayday decision points — practiced in small daily reps.</p>
              <Progress value={featured?.progressPercent ?? 34} className="mt-5" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[{label: 'Due cards', value: '18', icon: Flame}, {label: 'Weak topic', value: 'SCBA', icon: ShieldAlert}, {label: 'Goal', value: '25m', icon: Gauge}].map((item) => <div key={item.label} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><item.icon className="mb-3 text-red-200" size={18} /><p className="text-xl font-semibold">{item.value}</p><p className="text-xs text-muted">{item.label}</p></div>)}
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><div className="flex items-start gap-3"><Radio className="mt-0.5 text-amber-200" size={18} /><div><p className="font-medium">Educational support only</p><p className="mt-1 text-sm leading-6 text-muted">Built to reinforce official training, department SOPs, and instructor-led certification — not replace them.</p></div></div></div>
          </div>
        </Card>
      </div>
    </section>
    <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-20 sm:px-6 md:grid-cols-4">{pillars.map((pillar) => <Card key={pillar.title} className="group transition duration-200 hover:-translate-y-1 hover:border-primary/35 hover:bg-white/[0.055]"><pillar.icon className="mb-5 text-red-300 transition group-hover:scale-110" aria-hidden /><h2 className="font-semibold text-white">{pillar.title}</h2><p className="mt-2 text-sm leading-6 text-muted">{pillar.body}</p></Card>)}</section>
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6"><Card className="grid gap-6 overflow-hidden bg-gradient-to-br from-red-950/70 via-card to-amber-950/30 p-7 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-100">Ready for the next rep?</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Build mastery before the alarm drops.</h2><p className="mt-2 max-w-2xl text-muted">Jump into the dashboard, run mixed practice, or clear today&apos;s review queue.</p></div><Link href="/dashboard"><Button size="lg">Open dashboard <CheckCircle2 size={18} /></Button></Link></Card></section>
  </AppShell>
}
