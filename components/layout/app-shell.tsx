'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Brain, Flame, GraduationCap, LayoutDashboard, Moon, Search, ShieldCheck, Sun } from 'lucide-react'
import { educationalDisclaimer } from '@/data/academy'
import { NetworkStatusBanner } from '@/components/pwa/network-status-banner'
import { cn } from '@/lib/utils'

const CommandPalette = dynamic(() => import('@/components/search/command-palette').then((module) => module.CommandPalette), { ssr: false })
const navItems = [
  { href: '/dashboard', label: 'My learning', mobileLabel: 'Today', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', mobileLabel: 'Courses', icon: GraduationCap },
  { href: '/quiz', label: 'Practice', mobileLabel: 'Practice', icon: Brain },
  { href: '/flashcards', label: 'Flashcards', mobileLabel: 'Cards', icon: BookOpen },
]
const themeChangeEvent = 'firelearn-theme-change'
function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener(themeChangeEvent, onStoreChange)
  return () => window.removeEventListener(themeChangeEvent, onStoreChange)
}
function getLightThemeSnapshot() { return document.documentElement.dataset.theme === 'light' }
function getServerLightThemeSnapshot() { return false }

export function AppShell({ children, fullBleed = false }: { children: React.ReactNode; fullBleed?: boolean }) {
  const pathname = usePathname()
  const lightMode = React.useSyncExternalStore(subscribeToTheme, getLightThemeSnapshot, getServerLightThemeSnapshot)
  function toggleTheme() {
    const theme = lightMode ? 'dark' : 'light'
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    try { window.localStorage.setItem('firelearn.theme', theme) } catch { /* Theme works without storage. */ }
    window.dispatchEvent(new Event(themeChangeEvent))
  }
  function isActive(href: string) { return pathname === href || pathname.startsWith(href + '/') }
  const mobileTabs = [...navItems, { href: '/profile', label: 'Profile', mobileLabel: 'Profile', icon: ShieldCheck }]

  return <div className="min-h-screen pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-0">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <CommandPalette />
    <header className="fl-header sticky top-0 z-50 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="fl-brand flex items-center gap-2.5" aria-label="FireLearn home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Flame size={20} aria-hidden /></span>
            <span className="text-lg font-semibold tracking-tight">FireLearn</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} className={cn('rounded-xl px-3 py-2.5 text-sm font-medium transition-colors', isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-elevated hover:text-white')}>{item.label}</Link>)}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/search" aria-label="Search FireLearn" className="fl-header-action inline-flex"><Search size={18} aria-hidden /><span className="hidden xl:inline">Search</span></Link>
          <button type="button" onClick={toggleTheme} className="fl-header-action inline-flex" aria-label={`Switch to ${lightMode ? 'dark' : 'light'} theme`}>{lightMode ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}</button>
          <Link href="/profile" aria-label="Your profile" aria-current={isActive('/profile') ? 'page' : undefined} className="fl-header-action hidden md:inline-flex"><ShieldCheck size={18} aria-hidden /><span className="hidden xl:inline">Profile</span></Link>
        </div>
      </div>
    </header>
    <NetworkStatusBanner />
    <main id="main-content" tabIndex={-1} className={fullBleed ? 'outline-none' : 'mx-auto max-w-7xl px-4 py-8 outline-none sm:px-8 md:py-12'}><div className="fl-page-content">{children}</div></main>
    <nav className="fl-mobile-nav fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-lg md:hidden" aria-label="Primary navigation">
      <div className="grid grid-cols-5 gap-1">{mobileTabs.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} className={cn('flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition-colors', isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}><item.icon size={20} aria-hidden />{item.mobileLabel}</Link>)}</div>
    </nav>
    <footer className="border-t border-border px-4 py-8 text-sm text-muted-foreground sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold text-white"><Flame size={16} className="text-primary" aria-hidden />FireLearn</Link>
        <p className="max-w-2xl text-xs leading-6 md:text-right">{educationalDisclaimer}</p>
      </div>
    </footer>
  </div>
}
