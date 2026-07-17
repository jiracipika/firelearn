import type { Metadata } from 'next'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your FireLearn command dashboard — streaks, XP, quiz history, weak topics, study timer, and next recommended action.',
  openGraph: {
    title: 'FireLearn Dashboard',
    description: 'Track completions, quiz history, weak topics, and study streaks in one focused cockpit.',
  },
}

export default function DashboardPage() {
  return <DashboardOverview />
}
