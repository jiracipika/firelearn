'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Brain, Flame, GraduationCap, LayoutDashboard, Menu, Moon, Search, ShieldCheck, Sun, X } from 'lucide-react'
import { educationalDisclaimer } from '@/data/academy'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CommandPalette = dynamic(() => import('@/components/search/command-palette').then((module) => module.CommandPalette), { ssr: false })

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Academy', icon: GraduationCap },
  { href: '/quiz', label: 'Quiz', icon: Brain },
  { href: '/flashcards', label: 'Cards', icon: BookOpen },
]

export function AppShell({ children, fullBleed = false }: { children: React.ReactNode; fullBleed?: boolean }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [lightMode, setLightMode] = React.useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('firelearn.theme') === 'light'
  })

  React.useEffect(() => {
    document.documentElement.dataset.theme = lightMode ? 'light' : 'dark'
    window.localStorage.setItem('firelearn.theme', lightMode ? 'light' : 'dark')
  }, [lightMode])

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return <div className="min-h-screen pb-20 md:pb-0">
    <CommandPalette />
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
            <Button variant="ghost" size="sm"><Search size={16} /> <span className="hidden lg:inline">Search</span><span className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted xl:inline">⌘K</span></Button>
          </Link>
          <button
            type="button"
            onClick={() => setLightMode((value) => !value)}
            className="inline-flex min-h-8 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold text-muted-foreground transition hover:bg-elevated hover:text-white"
            aria-label="Toggle theme"
          >
            {lightMode ? <Moon size={16} /> : <Sun size={16} />}
            <span className="hidden lg:inline">{lightMode ? 'Dark' : 'Light'}</span>
          </button>
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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden" aria-label="Bottom navigation">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={cn('flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium transition', isActive(item.href) ? 'bg-elevated text-white' : 'text-muted-foreground')}>
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
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
