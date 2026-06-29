import { notFound } from 'next/navigation'
import { academyCourses } from '@/data/academy'
import { getCourseBySlug } from '@/lib/academy-selectors'
import { CourseDetail } from '@/components/course/course-detail'

export function generateStaticParams() {
  return academyCourses.map((course) => ({ courseSlug: course.slug }))
}

export default async function CoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params
  const course = getCourseBySlug(courseSlug)
  if (!course) notFound()
  return <CourseDetail course={course} />
}
