import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { academyCourses, getCategoryTitle } from '@/data/academy'
import { getCourseBySlug } from '@/lib/academy-selectors'
import { CourseCertificate } from '@/components/course/course-certificate'

export function generateStaticParams() {
  return academyCourses.map((course) => ({ courseSlug: course.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ courseSlug: string }> }): Promise<Metadata> {
  const { courseSlug } = await params
  const course = getCourseBySlug(courseSlug)
  if (!course) return {}

  return {
    title: `${course.title} — Completion Certificate | FireLearn`,
    description: `Completion certificate for the ${course.title} (${getCategoryTitle(course.categoryId)}) study path on FireLearn. Educational record only — not an official certification.`,
    robots: { index: false },
  }
}

export default async function CertificatePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params
  const course = getCourseBySlug(courseSlug)
  if (!course) notFound()
  return <CourseCertificate course={course} />
}
