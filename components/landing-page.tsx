import Link from 'next/link'
import { ArrowRight, BookOpen, Brain, Flame, Trophy } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const pillars = [
  { title: 'Structured academy', body: 'Categories, courses, modules, and lessons built for firefighter knowledge progression.', icon: BookOpen },
  { title: 'Quiz mastery', body: 'Question-bank architecture for practice, exam mode, scenarios, and weak topic detection.', icon: Brain },
  { title: 'Spaced repetition', body: 'Flashcards store ease, interval, next review, and review count for durable retention.', icon: Flame },
  { title: 'Progression', body: 'XP, streaks, achievements, completion, and daily goals reinforce consistent study.', icon: Trophy },
]

export function LandingPage() {
  return <AppShell fullBleed><section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
    <div className="space-y-7"><p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-200">FireLearn</p><h1 className="text-5xl font-semibold tracking-[-0.04em] md:text-7xl">Train Smarter.<br /><span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Respond Better.</span></h1><p className="max-w-2xl text-lg leading-8 text-muted">A modern learning platform for firefighters: structured courses, knowledge checks, quizzes, spaced repetition, and progress tracking in one maintainable academy architecture.</p><div className="flex flex-wrap gap-3"><Link href="/dashboard"><Button size="lg">Start learning <ArrowRight size={18} /></Button></Link><Link href="/courses"><Button variant="outline" size="lg">Browse academy</Button></Link></div></div>
    <Card className="space-y-5 bg-gradient-to-br from-card to-white/[0.04]"><div className="rounded-2xl border border-primary/20 bg-primary/10 p-5"><p className="text-sm text-red-100">Today&apos;s mission</p><p className="mt-2 text-3xl font-semibold">18 min</p><p className="mt-1 text-sm text-muted">Reading smoke indicators + review queue</p></div><div className="grid grid-cols-3 gap-3 text-center"><div><p className="text-2xl font-semibold">29</p><p className="text-xs text-muted">Categories</p></div><div><p className="text-2xl font-semibold">7</p><p className="text-xs text-muted">Question types</p></div><div><p className="text-2xl font-semibold">SM-2</p><p className="text-xs text-muted">Scheduler</p></div></div></Card>
  </section><section className="mx-auto grid max-w-7xl gap-4 px-5 pb-20 md:grid-cols-4">{pillars.map((pillar) => <Card key={pillar.title}><pillar.icon className="mb-4 text-red-300" aria-hidden /><h2 className="font-semibold">{pillar.title}</h2><p className="mt-2 text-sm leading-6 text-muted">{pillar.body}</p></Card>)}</section></AppShell>
}
