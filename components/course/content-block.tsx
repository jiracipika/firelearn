import type { LessonContentBlock } from '@/types/learning'
import { Card } from '@/components/ui/card'

export function ContentBlock({ block }: { block: LessonContentBlock }) {
  if (block.type === 'paragraph') {
    return <p className="text-base leading-8">{block.text}</p>
  }

  if (block.type === 'callout') {
    return <Card className="border-primary/25 bg-primary/8"><h2 className="flex items-center gap-2 font-bold text-red-200"><span className="inline-block size-1.5 rounded-full bg-primary" />{block.title}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{block.text}</p></Card>
  }

  return <Card><h2 className="font-bold text-white">{block.title}</h2><ul className="mt-3 space-y-2">{block.items.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{item}</li>)}</ul></Card>
}
