'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <main className="flex min-h-screen items-center justify-center bg-background p-6">
    <Card className="glass-card relative max-w-lg space-y-4 overflow-hidden p-8 text-center sm:p-10">
      <div className="absolute inset-x-20 top-0 h-20 bg-primary/15 blur-3xl" aria-hidden />
      <div className="relative">
        <div className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary animate-celebratory-bounce">
          <AlertTriangle size={26} />
        </div>
        <h1 className="heading-tight mt-5 text-3xl font-bold text-white">Module unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          FireLearn hit an unexpected error. Try again, and if it repeats, report what triggered it.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[11px] text-muted">Error reference: {error.digest}</p>
        )}
        <div className="mt-6 flex justify-center">
          <Button onClick={reset} className="press-feedback">
            <RefreshCw size={16} /> Try again
          </Button>
        </div>
      </div>
    </Card>
  </main>
}
