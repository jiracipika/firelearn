import type { Metadata, Viewport } from 'next'
import { Fraunces, Geist, Geist_Mono } from 'next/font/google'
import { RegisterServiceWorker } from '@/components/pwa/register-service-worker'
import './globals.css'
import AppTransitionShell from '@/components/app-transition-shell';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['opsz', 'SOFT', 'WONK'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://fflearn.vercel.app'),
  title: {
    default: 'FireLearn — Train Smarter. Respond Better.',
    template: '%s | FireLearn',
  },
  description: 'A modern firefighter learning platform with courses, quizzes, spaced repetition, and progress tracking.',
  manifest: '/manifest.webmanifest',
  applicationName: 'FireLearn',
  openGraph: {
    title: 'FireLearn — Train Smarter. Respond Better.',
    description: 'A firefighter learning console with courses, scenario-heavy quizzes, spaced-repetition flashcards, and progress tracking.',
    siteName: 'FireLearn',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FireLearn — Train Smarter. Respond Better.',
    description: 'A firefighter learning platform with courses, quizzes, flashcards, and progress tracking.',
  },
}

export const viewport: Viewport = { themeColor: '#0F1115', colorScheme: 'dark' }

const themeBootstrap = `(() => {
  try {
    const saved = localStorage.getItem('firelearn.theme');
    const theme = saved === 'light' || saved === 'dark'
      ? saved
      : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {}
})()`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`} suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
    <body>
      <AppTransitionShell>{children}</AppTransitionShell>
      <RegisterServiceWorker />
    </body>
  </html>
}
