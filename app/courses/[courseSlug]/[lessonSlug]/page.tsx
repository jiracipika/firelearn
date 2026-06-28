import { notFound } from 'next/navigation'
import { getAllLessons, getLessonBySlug } from '@/lib/academy-selectors'
import { LessonView } from '@/components/course/lesson-view'

export function generateStaticParams() {
  return getAllLessons().map(({ course, lesson }) => ({ courseSlug: course.slug, lessonSlug: lesson.slug }))
}

export default async function LessonPage({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params
  const result = getLessonBySlug(courseSlug, lessonSlug)
  if (!result) notFound()
  return <LessonView course={result.course} lesson={result.lesson} />
}
