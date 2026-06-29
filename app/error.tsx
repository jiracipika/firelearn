
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <main className="flex min-h-screen items-center justify-center bg-background p-6 text-white"><Card className="max-w-lg space-y-4 text-center"><h1 className="text-3xl font-semibold">Training module unavailable</h1><p className="text-muted">FireLearn hit an unexpected application error. Try again, and if it repeats, report the module and action that triggered it.</p><Button onClick={reset}>Try again</Button></Card></main>
}
