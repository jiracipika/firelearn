import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BookOpenCheck, Brain, CheckCircle2, Flame, Radio, Trophy } from 'lucide-react'
import { academyCourses } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { Progress } from '@/components/ui/progress'
import { Reveal, RevealOnMount, Stagger } from '@/components/ui/motion'

const pillars = [
  { index: '01', title: 'Academy paths', body: 'Progress from fundamentals to scenario-heavy fireground judgment with a scalable course model mapped to NFPA 1001 and 472.', icon: BookOpenCheck },
  { index: '02', title: 'Exam-grade quizzes', body: 'Practice mode, exam mode, explanations, weak-topic detection, and realistic incident prompts.', icon: Brain },
  { index: '03', title: 'Spaced repetition', body: 'SM-2 style scheduling keeps SCBA, mayday, codes, and tactics fresh between calls.', icon: Flame },
  { index: '04', title: 'Progress signals', body: 'XP, completion, streaks, and review queues create accountability without LMS clutter.', icon: Trophy },
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
  const progress = featured?.progressPercent ?? 34
  const minutes = featured?.estimatedMinutes ?? 0
  return <AppShell fullBleed>
    {/* ============ HERO: editorial copy left, instrument panel right ============ */}
    <section className="relative isolate overflow-hidden px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:pb-28 lg:pt-24">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 lg:grid-cols-[minmax(0,1.12fr)_minmax(400px,0.88fr)] lg:gap-20">
        <RevealOnMount className="min-w-0">
          <div className="fg-label flex items-center">
            <i className="fg-live-dot" aria-hidden />
            Firefighter training, recomposed
          </div>
          <h1 className="fg-hero-title mt-6">
            Train for the moments&nbsp;<em>that matter.</em>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            A firefighter learning console with embedded video tutorials, scenario-heavy quizzes, flashcards, and progress tracking — built around supervised training and local SOPs.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="fg-cta-primary press-feedback">
              Begin your training <span aria-hidden>&rarr;</span>
            </Link>
            <Link href="/courses" className="fg-cta-ghost press-feedback">
              Browse the academy
            </Link>
          </div>

          {/* Hairline stat strip — instrument readouts, not floating tiles */}
          <Stagger className="fg-strip mt-11 flex-col sm:flex-row" stagger={0.06}>
            {stats.map(([value, label]) => (
              <Reveal key={label} className="stat-tile-hover">
                <p className="fg-readout-mono text-2xl font-bold tracking-tight text-white">{value}</p>
                <p className="fg-label mt-2" style={{ fontSize: '8px' }}>{label}</p>
              </Reveal>
            ))}
          </Stagger>
        </RevealOnMount>

        {/* ============ THE INSTRUMENT — today&apos;s training queue as a fireground radio ============ */}
        <RevealOnMount delay={0.14}>
          <div className="fg-instrument mx-auto w-full max-w-lg p-6 sm:p-7">
            <div className="relative z-[1] flex items-center justify-between">
              <span className="fg-label">Today&apos;s training queue</span>
              <span className="fg-label text-success">
                <i className="fg-live-dot" aria-hidden style={{ background: 'var(--color-success)', boxShadow: '0 0 12px var(--color-success)' }} />
                On shift
              </span>
            </div>

            {/* Readout: continue-course headline in serif, ember */}
            <div className="relative z-[1] mt-9">
              <p className="fg-label" style={{ color: 'var(--fg-ember)' }}>Continue course</p>
              <h2 className="fg-readout mt-3 text-[clamp(34px,4vw,46px)]">{featured?.title ?? 'Fire behaviour foundations'}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Smoke reading, SCBA checks, incident command, and mayday decision points.</p>
            </div>

            {/* Progress track with mono readouts */}
            <div className="relative z-[1] mt-7">
              <Progress value={progress} />
              <div className="mt-3 flex items-center justify-between">
                <span className="fg-label">{progress}% complete</span>
                <span className="fg-label">{minutes} min</span>
              </div>
            </div>

            {/* Meter cells — hairline joined */}
            <div className="fg-strip relative z-[1] mt-7 !rounded-xl">
              {[
                { label: 'Tutorials', value: String(featured?.modules[0]?.lessons[0]?.videos.length ?? 3) },
                { label: 'Weak topic', value: 'SCBA' },
                { label: 'Daily goal', value: '25m' },
              ].map((item) => (
                <div key={item.label}>
                  <p className="fg-readout-mono text-base font-bold text-white">{item.value}</p>
                  <p className="fg-label mt-1.5" style={{ fontSize: '8px' }}>{item.label}</p>
                </div>
              ))}
            </div>

            <div className="relative z-[1] mt-7 flex items-start justify-between gap-3 border-t pt-5" style={{ borderColor: 'var(--fg-hairline)' }}>
              <div className="flex items-start gap-3">
                <Radio className="mt-0.5 shrink-0 text-amber-300" size={15} aria-hidden />
                <div>
                  <p className="text-sm font-medium text-white">Educational support only</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Reinforces official training, SOPs, and instructor-led certification. Not a replacement.</p>
                </div>
              </div>
              <Link href="/dashboard" aria-label="Resume training queue" className="fg-chip press-feedback shrink-0" style={{ width: 44, height: 44, borderRadius: 999 }}>
                <ArrowUpRight size={18} aria-hidden />
              </Link>
            </div>
          </div>
        </RevealOnMount>
      </div>

    </section>

    {/* ============ PILLARS — hairline contact-sheet grid ============ */}
    <section aria-labelledby="pillars-title" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <div className="mb-12 grid gap-8 md:grid-cols-2 md:items-end">
        <div>
          <p className="fg-label" style={{ color: 'var(--fg-ember)' }}>The system</p>
          <h2 id="pillars-title" className="mt-4 max-w-xl text-[clamp(34px,4.5vw,62px)] font-medium leading-[0.95] tracking-[-0.05em] text-white">
            One weakness.<br />One focused drill.
          </h2>
        </div>
        <p className="max-w-md text-[15px] leading-7 text-muted-foreground md:justify-self-end">
          No bloated curriculum. Four signals carry you from fundamentals to fireground judgment — pick the one you need and start.
        </p>
      </div>
      <Stagger className="fg-grid-section" stagger={0.08}>
        {pillars.map((pillar) => (
          <Reveal key={pillar.index}>
            <Link href="/dashboard" className="fg-grid-cell press-feedback group">
              <span className="fg-label">{pillar.index}</span>
              <span className="fg-chip mt-9 mb-6 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110">
                <pillar.icon size={24} aria-hidden />
              </span>
              <h3 className="text-[22px] font-medium tracking-[-0.03em] text-white">{pillar.title}</h3>
              <p className="mt-2 max-w-[32ch] text-xs leading-[1.6] text-muted-foreground">{pillar.body}</p>
              <span className="mt-auto flex items-center justify-between border-t pt-4 text-[10px] text-muted-foreground" style={{ borderColor: 'var(--fg-hairline)' }}>
                Open in dashboard
                <ArrowRight className="text-primary" size={15} aria-hidden />
              </span>
            </Link>
          </Reveal>
        ))}
      </Stagger>
    </section>

    {/* ============ CLOSING — giant serif statement ============ */}
    <RevealOnMount as="section" delay={0.05} className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:py-32">
      <div className="glass-card overflow-hidden rounded-[28px] p-8 sm:p-14">
        <p className="fg-label" style={{ color: 'var(--fg-ember)' }}>Ready for the next rep?</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_auto] lg:items-center">
          <h2 className="fg-closing-title">
            Build mastery before <em>the alarm drops.</em>
          </h2>
          <div className="flex flex-col gap-4 lg:items-end">
            <Link href="/dashboard" className="fg-cta-primary press-feedback">
              Open dashboard <CheckCircle2 size={17} aria-hidden />
            </Link>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground lg:text-right">
              Jump into the dashboard, run mixed practice, or clear today&apos;s review queue.
            </p>
          </div>
        </div>
      </div>
    </RevealOnMount>
  </AppShell>
}
