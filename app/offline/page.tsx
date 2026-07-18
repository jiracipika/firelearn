import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Brain, CloudOff, Flame, GraduationCap, LayoutDashboard } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { ReloadButton } from '@/components/pwa/reload-button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Offline',
  description: 'FireLearn is offline. Cached lessons, quizzes, and flashcards are still available.',
  robots: { index: false, follow: false },
}

const cachedRoutes = [
  { href: '/dashboard', label: 'Dashboard', description: 'Streaks, XP, and your next recommended action.', icon: LayoutDashboard },
  { href: '/courses', label: 'Academy', description: 'Cached course catalog and lesson content.', icon: GraduationCap },
  { href: '/quiz', label: 'Quiz practice', description: 'Practice quizzes run locally without a connection.', icon: Brain },
  { href: '/flashcards', label: 'Flashcards', description: 'Spaced-repetition reviews stay available offline.', icon: BookOpen },
]

/**
 * Dedicated offline fallback. Rendered by the service worker when a navigation
 * request fails AND no cached copy of the requested page is available. Kept
 * fully static (no client hooks, no data fetches) so it precaches and renders
 * with zero network dependency.
 */
export default function OfflinePage() {
  return <AppShell>
    <section className="mx-auto max-w-3xl space-y-8 py-6 md:py-12">
      <Card className="relative overflow-hidden p-8 text-center md:p-12">
        <div className="absolute inset-x-20 top-0 h-24 bg-primary/15 blur-3xl" aria-hidden />
        <div className="mx-auto mb-5 inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <CloudOff className="text-primary" size={32} aria-hidden />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">You&apos;re offline</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gradient-fire md:text-5xl">
          Connection lost
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          FireLearn can&apos;t reach the network right now. Your cached lessons, quizzes, and
          flashcards are still available below — progress saves locally and syncs when you reconnect.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <ReloadButton />
          <Link href="/">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </Card>

      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <Flame size={18} className="text-primary" /> Available while offline
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These core training areas are precached and keep working without a connection.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {cachedRoutes.map((route) => (
            <Link key={route.href} href={route.href} className="group">
              <Card className="h-full space-y-2 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <route.icon className="text-primary" size={20} aria-hidden />
                  </div>
                  <p className="font-bold text-white">{route.label}</p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{route.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  </AppShell>
}
