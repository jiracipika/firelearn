import Link from 'next/link'
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Brain, Flame, Layers3, Radar, RotateCcw } from 'lucide-react'
import { academyCourses } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { FiregroundScene } from '@/components/fireground-scene'
import { CourseCard } from '@/components/course/course-card'
import { Reveal, RevealOnMount, Stagger } from '@/components/ui/motion'

const lessonCount = academyCourses.reduce((total, course) => total + course.modules.reduce((sum, module) => sum + module.lessons.length, 0), 0)
const questionCount = academyCourses.reduce((total, course) => total + course.modules.reduce((sum, module) => sum + module.lessons.reduce((n, lesson) => n + lesson.quiz.length, 0), 0), 0)
const videoCount = academyCourses.reduce((total, course) => total + course.modules.reduce((sum, module) => sum + module.lessons.reduce((n, lesson) => n + lesson.videos.length, 0), 0), 0)

const modes = [
  { number: '01', title: 'Learn the craft.', text: 'Build a foundation with focused courses, field references, and video walkthroughs.', icon: BookOpen, href: '/courses', accent: 'orange' },
  { number: '02', title: 'Test the instinct.', text: 'Work through scenario questions and see the thinking behind each answer.', icon: Brain, href: '/quiz', accent: 'gold' },
  { number: '03', title: 'Keep it sharp.', text: 'Bring critical details back with a review queue that adapts to your recall.', icon: RotateCcw, href: '/flashcards', accent: 'blue' },
]

export function LandingPage() {
  return <AppShell fullBleed>
    <div className="fl-home">
      <section className="fl-hero" aria-labelledby="fl-hero-title">
        <div className="fl-hero-grain" aria-hidden />
        <div className="fl-hero-inner">
          <RevealOnMount className="fl-hero-copy">
            <div className="fl-eyebrow"><span className="fl-eyebrow-line" /> FIRELEARN / TRAINING PLATFORM <span className="fl-eyebrow-index">EST. FOR THE NEXT CALL</span></div>
            <h1 id="fl-hero-title" className="fl-display">When it counts,<br /><em>you&apos;ll know.</em></h1>
            <p className="fl-hero-lede">Real knowledge. Repeated until it sticks. Build the skills to read the scene, make the call, and keep learning between calls.</p>
            <div className="fl-hero-actions">
              <Link className="fl-button fl-button-primary" href="/dashboard">Enter the academy <ArrowUpRight size={19} aria-hidden /></Link>
              <Link className="fl-button fl-button-outline" href="/courses">Explore courses <ArrowRight size={18} aria-hidden /></Link>
            </div>
            <p className="fl-hero-note"><span className="fl-note-pulse" /> BUILT FOR REPS, REFLECTION & READINESS</p>
          </RevealOnMount>
          <RevealOnMount delay={0.12} className="fl-scene-wrap"><FiregroundScene /></RevealOnMount>
        </div>
        <div className="fl-hero-rail"><span>SCROLL TO EXPLORE</span><ArrowDownRight size={18} aria-hidden /><span>01 — 04</span></div>
      </section>

      <section className="fl-metrics" aria-label="Learning library at a glance">
        <div className="fl-section-width fl-metrics-inner">
          <div className="fl-metrics-intro"><span className="fl-kicker">A FULL LEARNING SYSTEM</span><strong>More than a course list.</strong></div>
          <div><strong>{academyCourses.length.toString().padStart(2, '0')}</strong><span>COURSE PATHS</span></div>
          <div><strong>{lessonCount}</strong><span>FOCUSED LESSONS</span></div>
          <div><strong>{videoCount}</strong><span>VIDEO TUTORIALS</span></div>
          <div><strong>{questionCount}</strong><span>QUIZ QUESTIONS</span></div>
        </div>
      </section>

      <section className="fl-section-width fl-modes" aria-labelledby="fl-modes-title">
        <Reveal className="fl-section-heading"><div><p className="fl-kicker">01 / THE METHOD</p><h2 id="fl-modes-title" className="fl-section-title">Training that<br /><em>stays with you.</em></h2></div><p>Learn it. Put it to the test. Come back to it. Every part of FireLearn works together to make the next rep count.</p></Reveal>
        <Stagger className="fl-mode-grid" stagger={0.09}>{modes.map((mode) => <Reveal key={mode.number}><Link className={`fl-mode-card fl-mode-${mode.accent}`} href={mode.href}>
          <div className="fl-mode-top"><span>{mode.number} / 03</span><ArrowUpRight size={21} aria-hidden /></div>
          <span className="fl-mode-symbol"><mode.icon size={35} strokeWidth={1.35} aria-hidden /></span>
          <div><h3>{mode.title}</h3><p>{mode.text}</p></div>
          <span className="fl-mode-link">EXPLORE MODE <ArrowRight size={17} aria-hidden /></span>
        </Link></Reveal>)}</Stagger>
      </section>

      <section className="fl-feature-band"><div className="fl-section-width fl-feature-inner">
        <Reveal><p className="fl-kicker">02 / THE APPROACH</p><h2>See the scene.<br /><em>Understand the why.</em></h2><p>Short focused lessons meet scenario based practice. Track your weak spots, revisit what matters, and build a study rhythm that fits around the job.</p><Link className="fl-text-link" href="/quiz">Try a practice quiz <ArrowUpRight size={18} aria-hidden /></Link></Reveal>
        <Reveal className="fl-feature-graphic" aria-label="Learning cycle: study, apply, review"><div className="fl-graphic-ring fl-ring-one"/><div className="fl-graphic-ring fl-ring-two"/><div className="fl-graphic-center"><Flame size={44} strokeWidth={1.2} aria-hidden /><span>THE NEXT<br />REP STARTS<br />HERE</span></div><span className="fl-graphic-tag fl-tag-one"><BookOpen size={16} aria-hidden /> STUDY</span><span className="fl-graphic-tag fl-tag-two"><Radar size={16} aria-hidden /> APPLY</span><span className="fl-graphic-tag fl-tag-three"><Layers3 size={16} aria-hidden /> REVIEW</span></Reveal>
      </div></section>

      <section className="fl-section-width fl-courses" aria-labelledby="fl-courses-title"><Reveal className="fl-section-heading"><div><p className="fl-kicker">03 / PICK YOUR PATH</p><h2 id="fl-courses-title" className="fl-section-title">Start somewhere.<br /><em>Go further.</em></h2></div><Link className="fl-text-link" href="/courses">View the entire academy <ArrowUpRight size={18} aria-hidden /></Link></Reveal><Stagger className="fl-course-grid" stagger={0.08}>{academyCourses.slice(0, 3).map(course => <Reveal key={course.id}><CourseCard course={course}/></Reveal>)}</Stagger></section>

      <section className="fl-final"><div className="fl-section-width"><p className="fl-kicker">04 / YOUR NEXT MOVE</p><h2>Ready for<br /><em>the next call?</em></h2><div className="fl-final-bottom"><p>Turn a few minutes today into knowledge you can reach for tomorrow. Educational study supports instructor led training and local procedures.</p><Link className="fl-button fl-button-primary" href="/dashboard">Start training <ArrowUpRight size={20} aria-hidden /></Link></div></div></section>
    </div>
  </AppShell>
}
