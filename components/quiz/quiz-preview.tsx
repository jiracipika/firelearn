import { academyCourses } from '@/data/academy'
import { AppShell } from '@/components/layout/app-shell'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function QuizPreview() {
  const questions = academyCourses.flatMap((course) => course.modules.flatMap((module) => module.lessons.flatMap((lesson) => lesson.quiz)))
  return <AppShell><div className="mx-auto max-w-3xl space-y-5"><Badge>Practice mode foundation</Badge><h1 className="text-4xl font-semibold">Quiz system</h1><p className="text-muted">Milestone 1 defines typed question banks for multiple choice, multiple answer, true/false, ordering, image, scenario, and case-study questions. The interactive engine lands in Milestone 3.</p>{questions.map((question) => <Card key={question.id}><p className="font-semibold">{question.prompt}</p><p className="mt-2 text-sm text-muted">{question.explanation}</p></Card>)}</div></AppShell>
}
