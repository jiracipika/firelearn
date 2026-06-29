import Link from 'next/link'
import { BookOpen, Brain, Flame, GraduationCap, LayoutDashboard, Search, ShieldCheck } from 'lucide-react'
import { educationalDisclaimer } from '@/data/academy'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Academy', icon: GraduationCap },
  { href: '/quiz', label: 'Quiz', icon: Brain },
  { href: '/flashcards', label: 'Cards', icon: BookOpen },
]

export function AppShell({ children, fullBleed = false }: { children: React.ReactNode; fullBleed?: boolean }) {
  return <div className="min-h-screen">
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#080a0f]/82 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-3" aria-label="FireLearn home">
          <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-red-500 to-accent text-white shadow-[0_0_35px_rgb(255_59_34_/_0.24)]"><span className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" /><Flame size={21} aria-hidden /></span>
          <span><span className="block text-sm font-semibold tracking-tight">FireLearn</span><span className="hidden text-[11px] text-muted sm:block">Train smarter. Respond better.</span></span>
        </Link>
        <nav className="hidden items-center rounded-2xl border border-white/[0.08] bg-white/[0.035] p-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => <Link key={item.href} href={item.href} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-white/[0.07] hover:text-white"><item.icon size={15} aria-hidden />{item.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/search"><Button variant="secondary" size="sm" aria-label="Open global search"><Search size={16} /> <span className="hidden sm:inline">Search</span></Button></Link>
          <Link href="/profile"><Button variant="ghost" size="sm"><ShieldCheck size={16} /> <span className="hidden lg:inline">Profile</span></Button></Link>
        </div>
      </div>
    </header>
    <main className={fullBleed ? '' : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12'}>{children}</main>
    <footer className="border-t border-white/[0.08] px-4 py-8 text-sm text-muted sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[0.55fr_1fr] md:items-start">
        <p className="font-semibold text-white">FireLearn · Train Smarter. Respond Better.</p>
        <p className="leading-6 md:text-right">{educationalDisclaimer}</p>
      </div>
    </footer>
  </div>
}
