import type { LessonContentBlock } from '@/types/learning'
import { Card } from '@/components/ui/card'

export function ContentBlock({ block }: { block: LessonContentBlock }) {
  if (block.type === 'paragraph') {
    return <Card><p className="leading-8 text-slate-200">{block.text}</p></Card>
  }

  if (block.type === 'callout') {
    return <Card className="border-primary/30 bg-primary/10"><h2 className="font-semibold text-red-100">{block.title}</h2><p className="mt-2 leading-7 text-red-50/80">{block.text}</p></Card>
  }

  return <Card><h2 className="font-semibold">{block.title}</h2><ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-muted">{block.items.map((item) => <li key={item}>{item}</li>)}</ul></Card>
}
