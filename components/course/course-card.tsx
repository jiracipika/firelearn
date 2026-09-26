import Link from 'next/link'
import { ArrowUpRight, Clock3, Layers3, Play } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { Course } from '@/types/learning'
import { getCategoryTitle } from '@/data/academy'

const accents = ['#ff7543', '#e8b774', '#83b8c2', '#c9a4ac', '#b0b881']

export function CourseCard({ course }: { course: Course }) {
  const lessons = course.modules.reduce((total, module) => total + module.lessons.length, 0)
  const videos = course.modules.reduce((total, module) => total + module.lessons.reduce((n, lesson) => n + lesson.videos.length, 0), 0)
  const accent = accents[course.slug.split('').reduce((sum, character) => sum + character.charCodeAt(0), 0) % accents.length]
  return <Link href={`/courses/${course.slug}`} className="fl-course-card" style={{ '--course-accent': accent } as CSSProperties}>
    <div className="fl-course-visual" aria-hidden="true"><span className="fl-course-orbit"/><span className="fl-course-orbit fl-course-orbit-small"/><span className="fl-course-glyph">{course.title.slice(0, 1).toUpperCase()}</span><span className="fl-course-index">FL / {course.id.slice(-3).toUpperCase()}</span></div>
    <div className="fl-course-body"><div className="fl-course-label"><span>{getCategoryTitle(course.categoryId)}</span><span>{course.difficulty}</span></div><h3>{course.title}</h3><p>{course.description}</p><div className="fl-course-meta"><span><Clock3 size={14} aria-hidden /> {course.estimatedMinutes} MIN</span><span><Layers3 size={14} aria-hidden /> {lessons} LESSONS</span><span><Play size={14} aria-hidden /> {videos} VIDEOS</span></div><div className="fl-course-bottom"><span>{course.progressPercent >= 100 ? 'REVIEW COURSE' : 'EXPLORE COURSE'}</span><ArrowUpRight size={20} aria-hidden /></div></div>
  </Link>
}
