import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllLessons, getLessonBySlug } from '@/lib/academy-selectors'
import { LessonView } from '@/components/course/lesson-view'

export function generateStaticParams() {
  return getAllLessons().map(({ course, lesson }) => ({ courseSlug: course.slug, lessonSlug: lesson.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params
  const result = getLessonBySlug(courseSlug, lessonSlug)
  if (!result) return {}

  const { course, lesson } = result
  const objectiveSummary = lesson.objectives.slice(0, 2).join('. ')

  return {
    title: `${lesson.title} — FireLearn Lesson`,
    description: `${objectiveSummary || lesson.videoPlaceholder} ${lesson.estimatedMinutes} min · ${lesson.difficulty} · ${lesson.quiz.length} quiz questions.`,
    openGraph: {
      title: lesson.title,
      description: lesson.videoPlaceholder,
      type: 'article',
    },
    keywords: [course.title, lesson.difficulty, 'firefighter lesson', ...lesson.objectives.slice(0, 5)],
  }
}

export default async function LessonPage({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params
  const result = getLessonBySlug(courseSlug, lessonSlug)
  if (!result) notFound()
  return <LessonView course={result.course} lesson={result.lesson} />
}
