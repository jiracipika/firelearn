import Link from 'next/link'
import { Brain, Clock, PlayCircle } from 'lucide-react'
import type { Lesson } from '@/types/learning'
import { Card } from '@/components/ui/card'

export function LessonCard({ courseSlug, lesson }: { courseSlug: string; lesson: Lesson }) {
  return (
    <Link href={`/courses/${courseSlug}/${lesson.slug}`}>
      <Card className="group flex h-full flex-col gap-3 transition duration-200 hover:-translate-y-1 hover:border-primary/30">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-md border border-border bg-elevated/60 px-2 py-0.5 text-xs text-muted-foreground">{lesson.difficulty}</span>
          <span className="flex items-center gap-1 text-xs text-muted"><Clock size={12} /> {lesson.estimatedMinutes}m</span>
        </div>
        <h3 className="flex-1 text-base font-bold leading-snug tracking-tight text-white">{lesson.title}</h3>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1"><PlayCircle size={12} /> {lesson.videos.length} videos</span>
          <span className="flex items-center gap-1"><Brain size={12} /> {lesson.quiz.length} quiz</span>
          <span>{lesson.flashcards.length} cards</span>
        </div>
        <span className="text-sm font-semibold text-primary transition group-hover:opacity-80">Watch and start</span>
      </Card>
    </Link>
  )
}
