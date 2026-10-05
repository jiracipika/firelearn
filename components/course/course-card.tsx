import Link from 'next/link'
import { ArrowRight, Clock3, Layers3 } from 'lucide-react'
import type { Course } from '@/types/learning'
import { getCategoryTitle } from '@/data/academy'
import { Progress } from '@/components/ui/progress'

export function CourseCard({ course, completedLessonIds }: { course: Course; completedLessonIds?: string[] }) {
  const lessons = course.modules.flatMap(module => module.lessons)
  const completedSet = new Set(completedLessonIds)
  const completed = lessons.filter(lesson => completedSet.has(lesson.id)).length
  const nextLesson = lessons.find(lesson => !completedSet.has(lesson.id))
  const href = completed > 0 && nextLesson ? `/courses/${course.slug}/${nextLesson.slug}` : `/courses/${course.slug}`
  const action = completed === lessons.length && lessons.length > 0 ? 'Revisit course' : completed > 0 ? 'Continue course' : 'View course'
  return <Link href={href} className="fl-course-card">
    <div className="fl-course-body">
      <div className="fl-course-label"><span>{getCategoryTitle(course.categoryId)}</span><span>{course.difficulty}</span></div>
      <h3>{course.title}</h3><p>{course.description}</p>
      <div className="fl-course-meta"><span><Clock3 size={14} aria-hidden />{course.estimatedMinutes} min</span><span><Layers3 size={14} aria-hidden />{lessons.length} lessons</span></div>
      {completed > 0 && <div className="fl-course-progress"><Progress value={completed / lessons.length * 100} label={`${course.title} progress`} /><p className="mt-2 text-xs text-muted">{completed} of {lessons.length} completed</p></div>}
      <div className="fl-course-bottom"><span>{action}</span><ArrowRight size={18} aria-hidden /></div>
    </div>
  </Link>
}
