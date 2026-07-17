import type { Metadata } from 'next'
import { ProfileOverview } from '@/components/profile/profile-overview'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Your FireLearn learner profile — level, XP, streak, achievements, leaderboard, and data export tools.',
  robots: { index: false },
}

export default function ProfilePage() {
  return <ProfileOverview />
}
