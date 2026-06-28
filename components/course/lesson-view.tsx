import { CheckCircle2, PlayCircle } from 'lucide-react'
import { getFeaturedLesson } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function LessonView() {
  const lesson = getFeaturedLesson()
  if (!lesson) return <AppShell><Card>No lesson available.</Card></AppShell>
  return <AppShell><article className="mx-auto max-w-4xl space-y-6">
    <Badge>{lesson.difficulty} · {lesson.estimatedMinutes} min</Badge>
    <div className="space-y-3"><h1 className="text-4xl font-semibold tracking-tight">{lesson.title}</h1><p className="text-muted">{lesson.videoPlaceholder}</p><Progress value={lesson.completion.percent} /></div>
    <Card className="grid gap-6 md:grid-cols-2"><div><h2 className="font-semibold">Objectives</h2><ul className="mt-3 space-y-2 text-sm text-muted">{lesson.objectives.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-success" />{item}</li>)}</ul></div><div><h2 className="font-semibold">Prerequisites</h2><ul className="mt-3 space-y-2 text-sm text-muted">{lesson.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul></div></Card>
    <Card className="flex min-h-56 items-center justify-center border-dashed text-muted"><PlayCircle className="mr-2" /> Video placeholder</Card>
    {lesson.content.map((block) => <Card key={block.type + ('title' in block ? block.title : block.text.slice(0, 20))}>{block.type === 'paragraph' && <p className="leading-7 text-slate-200">{block.text}</p>}{block.type === 'callout' && <div><h2 className="font-semibold text-red-200">{block.title}</h2><p className="mt-2 text-muted">{block.text}</p></div>}{block.type === 'list' && <div><h2 className="font-semibold">{block.title}</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-muted">{block.items.map((item) => <li key={item}>{item}</li>)}</ul></div>}</Card>)}
    <Card><h2 className="font-semibold">Knowledge check</h2><p className="mt-2 text-muted">{lesson.knowledgeCheck.prompt}</p></Card>
    <Card><h2 className="font-semibold">Summary</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-muted">{lesson.summary.map((item) => <li key={item}>{item}</li>)}</ul></Card>
    <Card><h2 className="font-semibold">References</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-muted">{lesson.references.map((item) => <li key={item}>{item}</li>)}</ul></Card>
  </article></AppShell>
}
