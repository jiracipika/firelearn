import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-background p-6">
    <Card className="max-w-lg space-y-4 text-center">
      <h1 className="text-3xl font-bold text-white">Page not found</h1>
      <p className="text-sm leading-6 text-muted-foreground">That FireLearn route does not exist or has not been published yet.</p>
      <Link href="/courses"><Button>Browse courses</Button></Link>
    </Card>
  </main>
}
