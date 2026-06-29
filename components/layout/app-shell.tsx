'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Brain, Flame, GraduationCap, LayoutDashboard, Menu, Search, ShieldCheck, X } from 'lucide-react'
import { educationalDisclaimer } from '@/data/academy'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Academy', icon: GraduationCap },
  { href: '/quiz', label: 'Quiz', icon: Brain },
  { href: '/flashcards', label: 'Cards', icon: BookOpen },
]

export function AppShell({ children, fullBleed = false }: { children: React.ReactNode; fullBleed?: boolean }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return <div className="min-h-screen">
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="FireLearn home">
            <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary-dim shadow-[0_0_25px_rgb(255_74_46_/_0.35)]">
              <Flame size={18} className="text-white" aria-hidden />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight">FireLearn</span>
              <span className="hidden text-[10px] text-muted sm:block">Train smarter</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive(item.href)
                    ? 'bg-elevated text-white'
                    : 'text-muted-foreground hover:bg-elevated/60 hover:text-white'
                )}
              >
                <item.icon size={15} aria-hidden />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/search" aria-label="Open global search">
            <Button variant="ghost" size="sm"><Search size={16} /> <span className="hidden lg:inline">Search</span></Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost" size="sm"><ShieldCheck size={16} /> <span className="hidden lg:inline">Profile</span></Button>
          </Link>
          <button
            className="inline-flex size-10 items-center justify-center rounded-lg border border-border-bright bg-elevated/60 text-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="border-t border-border bg-background/95 px-4 py-3 md:hidden" aria-label="Mobile navigation">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition',
                  isActive(item.href)
                    ? 'bg-elevated text-white'
                    : 'text-muted-foreground hover:bg-elevated/60 hover:text-white'
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
    <main className={fullBleed ? '' : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12'}>{children}</main>
    <footer className="border-t border-border px-4 py-8 text-sm text-muted sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[0.5fr_1fr] md:items-start">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-primary" />
          <span className="font-semibold text-white">FireLearn</span>
          <span className="text-muted">Train Smarter. Respond Better.</span>
        </div>
        <p className="leading-6 md:text-right">{educationalDisclaimer}</p>
      </div>
    </footer>
  </div>
}
