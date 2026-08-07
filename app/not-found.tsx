import Link from 'next/link'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-background p-6">
    <Card className="relative max-w-lg space-y-4 overflow-hidden p-8 text-center">
      <div className="absolute inset-x-20 top-0 h-20 bg-info/12 blur-3xl" aria-hidden />
      <div className="relative">
        <div className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl border border-info/30 bg-info/10 text-info">
          <Compass size={26} />
        </div>
        <p className="mt-5 text-6xl font-bold tracking-tight text-gradient-fire">404</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          That FireLearn route does not exist or has not been published yet.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard"><Button>Open dashboard</Button></Link>
          <Link href="/courses"><Button variant="outline">Browse courses</Button></Link>
        </div>
      </div>
    </Card>
  </main>
}
