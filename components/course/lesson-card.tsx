import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock, PlayCircle } from 'lucide-react'
import type { Lesson } from '@/types/learning'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function LessonCard({ courseSlug, lesson }: { courseSlug: string; lesson: Lesson }) {
  return <Card className="group space-y-4 transition duration-200 hover:-translate-y-1 hover:border-primary/35 hover:bg-white/[0.055]">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2"><p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted"><Clock size={14} /> {lesson.estimatedMinutes} min · {lesson.difficulty}</p><h3 className="text-xl font-semibold tracking-tight text-white">{lesson.title}</h3></div>
      {lesson.completion.completed ? <CheckCircle2 className="text-success" aria-label="Completed" /> : <PlayCircle className="text-red-200" aria-hidden />}
    </div>
    <Progress value={lesson.completion.percent} />
    <p className="text-sm leading-6 text-muted">{lesson.objectives[0]}</p>
    <Link href={`/courses/${courseSlug}/${lesson.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-red-100 hover:text-white">Open lesson <ArrowRight size={15} className="transition group-hover:translate-x-1" /></Link>
  </Card>
}
