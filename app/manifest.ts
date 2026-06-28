import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FireLearn',
    short_name: 'FireLearn',
    description: 'Firefighter learning with courses, quizzes, flashcards, and progress tracking.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F1115',
    theme_color: '#0F1115',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  }
}
