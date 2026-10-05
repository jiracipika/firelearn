import type { Metadata, Viewport } from 'next'
import { Fraunces, Geist, Geist_Mono } from 'next/font/google'
import { RegisterServiceWorker } from '@/components/pwa/register-service-worker'
import './globals.css'

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
    default: 'FireLearn — Learn at your own pace.',
    template: '%s | FireLearn',
  },
  description: 'Firefighter study with courses, quizzes, spaced repetition, and progress tracking.',
  manifest: '/manifest.webmanifest',
  applicationName: 'FireLearn',
  openGraph: {
    title: 'FireLearn — Learn at your own pace.',
    description: 'Firefighter study with courses, scenario-heavy quizzes, spaced-repetition flashcards, and progress tracking.',
    siteName: 'FireLearn',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FireLearn — Learn at your own pace.',
    description: 'A firefighter learning platform with courses, quizzes, flashcards, and progress tracking.',
  },
}

export const viewport: Viewport = { themeColor: '#191c1a', colorScheme: 'light dark' }

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
      {children}
      <RegisterServiceWorker />
    </body>
  </html>
}
