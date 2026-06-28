import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'FireLearn — Train smarter for the fireground',
  description:
    'FireLearn is a modern training platform for firefighters: lessons, quizzes, flashcards, and progress tracking across fire behavior, incident command, hazmat, and more.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#0E1117',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
