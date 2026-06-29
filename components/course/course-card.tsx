import Link from 'next/link'
import { ArrowRight, Clock, Flame, Layers } from 'lucide-react'
import type { Course } from '@/types/learning'
import { getCategoryTitle } from '@/data/academy'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function CourseCard({ course }: { course: Course }) {
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0)
  return <Card className="group flex h-full flex-col gap-5 overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-primary/35 hover:bg-white/[0.055]">
    <div className="flex items-start justify-between gap-4">
      <Badge>{getCategoryTitle(course.categoryId)}</Badge>
      <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-muted">{course.difficulty}</span>
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-semibold tracking-[-0.025em] text-white">{course.title}</h3>
      <p className="line-clamp-3 text-sm leading-6 text-muted">{course.description}</p>
    </div>
    <div className="mt-auto space-y-4">
      <div className="grid grid-cols-3 gap-2 text-xs text-muted"><span className="flex items-center gap-1"><Clock size={14} /> {course.estimatedMinutes}m</span><span className="flex items-center gap-1"><Flame size={14} /> {course.xp} XP</span><span className="flex items-center gap-1"><Layers size={14} /> {lessonCount} lessons</span></div>
      <Progress value={course.progressPercent} />
      <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-red-100 transition hover:text-white">Open course <ArrowRight size={15} className="transition group-hover:translate-x-1" /></Link>
    </div>
  </Card>
}
