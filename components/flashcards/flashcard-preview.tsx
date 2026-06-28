import { academyCourses } from '@/data/academy'
import { cardStage } from '@/services/spaced-repetition'
import { AppShell } from '@/components/layout/app-shell'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function FlashcardPreview() {
  const cards = academyCourses.flatMap((course) => course.modules.flatMap((module) => module.lessons.flatMap((lesson) => lesson.flashcards)))
  return <AppShell><div className="mx-auto max-w-4xl space-y-5"><Badge>SM-2 scheduler foundation</Badge><h1 className="text-4xl font-semibold">Flashcards</h1><p className="text-muted">Cards now carry ease factor, interval, review count, next review, and stage data. The full review UI lands in Milestone 4.</p><div className="grid gap-4 md:grid-cols-2">{cards.map((card) => <Card key={card.id}><p className="text-sm text-red-200">{cardStage(card)}</p><h2 className="mt-2 font-semibold">{card.front}</h2><p className="mt-3 text-sm text-muted">{card.back}</p></Card>)}</div></div></AppShell>
}
