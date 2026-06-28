import { academyCourses } from '@/data/academy'
import { LessonView } from '@/components/course/lesson-view'

export default function LessonPage() {
  const course = academyCourses[0]
  const lesson = course.modules[0].lessons[0]
  return <LessonView course={course} lesson={lesson} />
}
