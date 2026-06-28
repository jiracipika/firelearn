import Link from 'next/link'
import { CheckCircle2, Clock, PlayCircle } from 'lucide-react'
import type { Lesson } from '@/types/learning'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function LessonCard({ courseSlug, lesson }: { courseSlug: string; lesson: Lesson }) {
  return <Card className="space-y-4">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-xs text-muted"><Clock size={14} /> {lesson.estimatedMinutes} min · {lesson.difficulty}</p>
        <h3 className="text-xl font-semibold">{lesson.title}</h3>
      </div>
      {lesson.completion.completed ? <CheckCircle2 className="text-success" aria-label="Completed" /> : <PlayCircle className="text-red-200" aria-hidden />}
    </div>
    <Progress value={lesson.completion.percent} />
    <p className="text-sm leading-6 text-muted">{lesson.objectives[0]}</p>
    <Link href={`/courses/${courseSlug}/${lesson.slug}`} className="inline-flex text-sm font-semibold text-red-200 hover:text-white">Open lesson →</Link>
  </Card>
}
