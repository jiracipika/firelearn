import Link from 'next/link'
import { ArrowRight, BookOpenCheck, Brain, CheckCircle2, Flame, Gauge, PlayCircle, Radio, ShieldAlert, Sparkles, Trophy } from 'lucide-react'
import { academyCourses } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Reveal, RevealOnMount, Stagger } from '@/components/ui/motion'

const pillars = [
  { title: 'Academy paths', body: 'Progress from fundamentals to scenario-heavy fireground judgment with a scalable course model mapped to NFPA 1001 and 472.', icon: BookOpenCheck },
  { title: 'Exam-grade quizzes', body: 'Practice mode, exam mode, explanations, weak-topic detection, and realistic incident prompts.', icon: Brain },
  { title: 'Spaced repetition', body: 'SM-2 style scheduling keeps SCBA, mayday, codes, and tactics fresh between calls.', icon: Flame },
  { title: 'Progress signals', body: 'XP, completion, streaks, and review queues create accountability without LMS clutter.', icon: Trophy },
]

const lessonCount = academyCourses.reduce((total, course) => total + course.modules.reduce((courseTotal, module) => courseTotal + module.lessons.length, 0), 0)
const questionCount = academyCourses.reduce((total, course) => total + course.modules.reduce((moduleTotal, module) => moduleTotal + module.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.quiz.length, 0), 0), 0)
const videoCount = academyCourses.reduce((total, course) => total + course.modules.reduce((moduleTotal, module) => moduleTotal + module.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.videos.length, 0), 0), 0)

const stats = [
  [String(academyCourses.length), 'Courses'],
  [String(lessonCount), 'Lessons'],
  [String(videoCount), 'Videos'],
  [String(questionCount), 'Quiz questions'],
  ['SM-2', 'Review engine'],
] as const

export function LandingPage() {
  const featured = academyCourses[0]
  return <AppShell fullBleed>
    <section
      className="relative isolate overflow-hidden px-4 pb-12 pt-10 sm:px-6 sm:pt-16 lg:pb-20 lg:pt-24"
      style={{
        backgroundImage: "linear-gradient(90deg, rgb(7 9 13 / 0.94), rgb(7 9 13 / 0.72) 48%, rgb(7 9 13 / 0.48)), linear-gradient(180deg, transparent 70%, #07090d), url('/hero-fireground.png')",
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="mx-auto max-w-7xl">
        <RevealOnMount className="max-w-3xl space-y-6 sm:space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-bright bg-background/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-100 backdrop-blur">
            <Sparkles size={13} /> Firefighter training, rebuilt
          </div>
          <h1 className="max-w-5xl text-4xl font-bold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            <span className="text-gradient-fire">FireLearn</span>
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-xl sm:leading-8">
            A firefighter learning console with embedded video tutorials, scenario-heavy quizzes, flashcards, and progress tracking built around supervised training and local SOPs.
          </p>
          <div className="grid gap-3 sm:flex sm:flex-wrap">
            <Link href="/dashboard" className={buttonVariants({ size: 'lg' })}>
              Start learning <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/courses" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Browse academy
            </Link>
          </div>
          <Stagger className="mobile-snap-row max-w-3xl sm:grid sm:grid-cols-5 sm:gap-3" stagger={0.07}>
            {stats.map(([value, label]) => (
              <Reveal key={label} className="stat-tile-hover min-w-32 snap-start rounded-2xl border border-border-bright bg-background/70 p-4 backdrop-blur sm:min-w-0">
                <p className="text-3xl font-bold tracking-tight text-gradient-flame">{value}</p>
                <p className="mt-1 text-xs text-muted">{label}</p>
              </Reveal>
            ))}
          </Stagger>
        </RevealOnMount>

        <RevealOnMount delay={0.18}>
          <Card interactive className="mt-8 max-w-3xl overflow-hidden border-border-bright bg-background/78 p-0 sm:mt-10">
            <div className="border-b border-border bg-elevated/50 px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">Today&apos;s training queue</p>
                <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Live path</span>
              </div>
            </div>
            <div className="space-y-5 p-5">
              <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/12 to-transparent p-5">
                <p className="text-sm font-medium text-red-200">Continue course</p>
                <h2 className="mt-2 text-xl font-bold text-white">{featured?.title ?? 'Fire behaviour foundations'}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Smoke reading, SCBA checks, incident command, and mayday decision points.</p>
                <Progress value={featured?.progressPercent ?? 34} className="mt-5" />
                <div className="mt-3 flex items-center justify-between text-xs text-muted">
                  <span>{featured?.progressPercent ?? 34}% complete</span>
                  <span>{featured?.estimatedMinutes ?? 0} min</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'Tutorials', value: String(featured?.modules[0]?.lessons[0]?.videos.length ?? 3), icon: PlayCircle, tone: 'text-info' },
                  { label: 'Weak topic', value: 'SCBA', icon: ShieldAlert, tone: 'text-amber-300' },
                  { label: 'Goal', value: '25m', icon: Gauge, tone: 'text-green-300' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border bg-elevated/40 p-3 sm:p-4">
                    <item.icon className={item.tone} size={18} />
                    <p className="mt-2 text-lg font-bold text-white">{item.value}</p>
                    <p className="text-xs text-muted">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-border bg-elevated/40 p-3 sm:p-4">
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
        </RevealOnMount>
      </div>
    </section>

    <Stagger as="section" className="mobile-snap-row mx-auto max-w-7xl px-4 py-12 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 md:grid-cols-4 md:py-16" stagger={0.08}>
      {pillars.map((pillar) => (
        <Reveal key={pillar.title}>
          <Card interactive className="group min-h-full min-w-[82vw] snap-start transition duration-200 sm:min-w-0 hover:-translate-y-1 hover:border-primary/30">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
              <pillar.icon className="text-primary" size={22} aria-hidden />
            </div>
            <h2 className="font-bold text-white">{pillar.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.body}</p>
          </Card>
        </Reveal>
      ))}
    </Stagger>

    <RevealOnMount as="section" delay={0.05} className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <Card interactive className="grid gap-6 overflow-hidden border-border-bright bg-gradient-to-r from-card via-card to-elevated p-5 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">Ready for the next rep?</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gradient-fire">Build mastery before the alarm drops.</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">Jump into the dashboard, run mixed practice, or clear today&apos;s review queue.</p>
        </div>
        <Link href="/dashboard" className={buttonVariants({ size: 'lg' })}>
          Open dashboard <CheckCircle2 size={18} aria-hidden />
        </Link>
      </Card>
    </RevealOnMount>
  </AppShell>
}
