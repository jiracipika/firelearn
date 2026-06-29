import Link from 'next/link'
import { ArrowRight, Clock, Flame, Layers } from 'lucide-react'
import type { Course } from '@/types/learning'
import { getCategoryTitle } from '@/data/academy'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function CourseCard({ course }: { course: Course }) {
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0)
  return (
    <Link href={`/courses/${course.slug}`} className="block">
      <Card className="group flex h-full flex-col gap-4 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_60px_rgb(255_59_34_/_0.12)]">
        <div className="flex items-start justify-between gap-3">
          <Badge>{getCategoryTitle(course.categoryId)}</Badge>
          <span className="rounded-lg border border-border bg-elevated/60 px-2 py-0.5 text-xs text-muted-foreground">{course.difficulty}</span>
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-bold leading-snug tracking-tight text-white">{course.title}</h3>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{course.description}</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><Clock size={13} /> {course.estimatedMinutes}m</span>
            <span className="flex items-center gap-1.5"><Flame size={13} /> {course.xp} XP</span>
            <span className="flex items-center gap-1.5"><Layers size={13} /> {lessonCount}</span>
          </div>
          <Progress value={course.progressPercent} />
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:gap-2.5">Open course <ArrowRight size={14} /></span>
        </div>
      </Card>
    </Link>
  )
}
