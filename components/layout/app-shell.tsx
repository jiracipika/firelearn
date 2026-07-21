'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Brain, Flame, GraduationCap, LayoutDashboard, Moon, Search, ShieldCheck, Sun } from 'lucide-react'
import { educationalDisclaimer } from '@/data/academy'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CommandPalette = dynamic(() => import('@/components/search/command-palette').then((module) => module.CommandPalette), { ssr: false })

const navItems = [
  { href: '/dashboard', label: 'Today', icon: LayoutDashboard },
  { href: '/courses', label: 'Academy', icon: GraduationCap },
  { href: '/quiz', label: 'Quiz', icon: Brain },
  { href: '/flashcards', label: 'Cards', icon: BookOpen },
]

const themeChangeEvent = 'firelearn-theme-change'

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener(themeChangeEvent, onStoreChange)
  return () => window.removeEventListener(themeChangeEvent, onStoreChange)
}

function getLightThemeSnapshot() {
  return document.documentElement.dataset.theme === 'light'
}

function getServerLightThemeSnapshot() {
  return false
}

export function AppShell({ children, fullBleed = false }: { children: React.ReactNode; fullBleed?: boolean }) {
  const pathname = usePathname()
  const lightMode = React.useSyncExternalStore(subscribeToTheme, getLightThemeSnapshot, getServerLightThemeSnapshot)

  function toggleTheme() {
    const nextLightMode = !lightMode
    const theme = nextLightMode ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    try {
      window.localStorage.setItem('firelearn.theme', theme)
    } catch {
      // The visual preference still works when storage is blocked or unavailable.
    }
    window.dispatchEvent(new Event(themeChangeEvent))
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const mobileTabs = [...navItems, { href: '/profile', label: 'Profile', icon: ShieldCheck }]

  return <div className="min-h-screen pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-0">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-primary-foreground">Skip to content</a>
    <CommandPalette />
    <header className="sticky top-0 z-50 border-b border-border bg-background/86 pt-[env(safe-area-inset-top)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="FireLearn home">
            <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary-dim shadow-[0_0_25px_rgb(255_74_46_/_0.35)] transition-shadow duration-300 group-hover:shadow-[0_0_35px_rgb(255_74_46_/_0.55)]">
              <Flame size={18} className="text-white animate-flame-flicker" aria-hidden />
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
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-gradient-to-br from-primary/20 to-primary/5 text-white shadow-[inset_0_0_0_1px_rgb(255_74_46_/_0.2)]'
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
            onClick={toggleTheme}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-muted-foreground transition hover:bg-elevated hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            aria-label={`Switch to ${lightMode ? 'dark' : 'light'} theme`}
          >
            {lightMode ? <Moon size={16} /> : <Sun size={16} />}
            <span className="hidden lg:inline">{lightMode ? 'Dark' : 'Light'}</span>
          </button>
          <Link href="/profile" className="hidden md:inline-flex">
            <Button variant="ghost" size="sm"><ShieldCheck size={16} /> <span className="hidden lg:inline">Profile</span></Button>
          </Link>
        </div>
      </div>
    </header>
    <main id="main-content" className={fullBleed ? '' : 'mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-12'}>{children}</main>
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl md:hidden" aria-label="Primary navigation">
      <div className="grid grid-cols-5 gap-1">
        {mobileTabs.map((item) => (
          <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} className={cn('flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60', isActive(item.href) ? 'bg-gradient-to-b from-primary/18 to-primary/8 text-white shadow-[inset_0_0_0_1px_rgb(255_74_46_/_0.22)]' : 'text-muted-foreground')}>
            <item.icon size={19} aria-hidden />
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
