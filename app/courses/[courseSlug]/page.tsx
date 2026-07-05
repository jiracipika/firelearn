import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { academyCourses, getCategoryTitle } from '@/data/academy'
import { getCourseBySlug } from '@/lib/academy-selectors'
import { CourseDetail } from '@/components/course/course-detail'

export function generateStaticParams() {
  return academyCourses.map((course) => ({ courseSlug: course.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ courseSlug: string }> }): Promise<Metadata> {
  const { courseSlug } = await params
  const course = getCourseBySlug(courseSlug)
  if (!course) return {}

  const lessonCount = course.modules.reduce((total, mod) => total + mod.lessons.length, 0)
  const questionCount = course.modules.reduce(
    (total, mod) => total + mod.lessons.reduce((lt, lesson) => lt + lesson.quiz.length, 0),
    0,
  )

  return {
    title: `${course.title} — FireLearn Course`,
    description: `${course.description} ${lessonCount} lessons, ${questionCount} quiz questions, ${course.estimatedMinutes} min · ${course.difficulty}.`,
    openGraph: {
      title: course.title,
      description: course.description,
      type: 'website',
    },
    keywords: [getCategoryTitle(course.categoryId), course.difficulty, 'firefighter training', ...course.modules.flatMap((mod) => mod.lessons.map((lesson) => lesson.title))],
  }
}

export default async function CoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params
  const course = getCourseBySlug(courseSlug)
  if (!course) notFound()
  return <CourseDetail course={course} />
}
