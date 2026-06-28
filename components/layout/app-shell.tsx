import Link from 'next/link'
import { Flame, Search } from 'lucide-react'
import { educationalDisclaimer } from '@/data/academy'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/courses', label: 'Courses' },
  { href: '/lesson', label: 'Lesson' },
  { href: '/quiz', label: 'Quizzes' },
  { href: '/flashcards', label: 'Flashcards' },
]

export function AppShell({ children, fullBleed = false }: { children: React.ReactNode; fullBleed?: boolean }) {
  return <div className="min-h-screen">
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-3" aria-label="FireLearn home">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white"><Flame size={22} aria-hidden /></span>
          <span className="font-semibold tracking-tight">FireLearn</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-white/8 hover:text-white">{item.label}</Link>)}
        </nav>
        <Button variant="ghost" size="sm" aria-label="Open global search"><Search size={18} /> Search</Button>
      </div>
    </header>
    <main className={fullBleed ? '' : 'mx-auto max-w-7xl px-5 py-8 md:py-12'}>{children}</main>
    <footer className="border-t border-border/80 px-5 py-6 text-sm text-muted">
      <div className="mx-auto max-w-7xl space-y-2">
        <p className="font-medium text-white">Train Smarter. Respond Better.</p>
        <p>{educationalDisclaimer}</p>
      </div>
    </footer>
  </div>
}
