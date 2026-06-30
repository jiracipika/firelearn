import { notFound } from 'next/navigation'
import { academyCourses } from '@/data/academy'
import { getCourseBySlug } from '@/lib/academy-selectors'
import { CourseCertificate } from '@/components/course/course-certificate'

export function generateStaticParams() {
  return academyCourses.map((course) => ({ courseSlug: course.slug }))
}

export default async function CertificatePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params
  const course = getCourseBySlug(courseSlug)
  if (!course) notFound()
  return <CourseCertificate course={course} />
}
