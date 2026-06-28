import Link from 'next/link'
import { Clock, Flame } from 'lucide-react'
import type { Course } from '@/types/learning'
import { getCategoryTitle } from '@/data/academy'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function CourseCard({ course }: { course: Course }) {
  return <Card className="flex h-full flex-col gap-4 transition hover:-translate-y-0.5 hover:border-primary/40">
    <div className="flex items-start justify-between gap-4">
      <Badge>{getCategoryTitle(course.categoryId)}</Badge>
      <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-muted">{course.difficulty}</span>
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-semibold tracking-tight">{course.title}</h3>
      <p className="text-sm leading-6 text-muted">{course.description}</p>
    </div>
    <div className="mt-auto space-y-3">
      <div className="flex items-center justify-between text-xs text-muted"><span className="flex items-center gap-1"><Clock size={14} /> {course.estimatedMinutes} min</span><span className="flex items-center gap-1"><Flame size={14} /> {course.xp} XP</span></div>
      <Progress value={course.progressPercent} />
      <Link href="/lesson" className="inline-flex text-sm font-semibold text-red-200 hover:text-white">Continue course →</Link>
    </div>
  </Card>
}
