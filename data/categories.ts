import type { Category } from '@/types/learning'

const names = [
  'Fire Behaviour',
  'Building Construction',
  'Fire Dynamics',
  'Search & Rescue',
  'Incident Command',
  'Communications',
  'Ventilation',
  'Ladders',
  'Ropes',
  'Forcible Entry',
  'PPE',
  'SCBA',
  'Medical',
  'Vehicle Extrication',
  'Hazmat Awareness',
  'Wildland Firefighting',
  'Fire Prevention',
  'Fire Investigation',
  'Emergency Driving',
  'Water Supply',
  'Pump Operations',
  'Hydraulics',
  'Fire Streams',
  'Thermal Imaging',
  'Leadership',
  'Mental Health',
  'Mayday Procedures',
  'Canadian Fire Codes',
  'NFPA Standards',
] as const

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const categories: Category[] = names.map((title) => ({
  id: slugify(title),
  slug: slugify(title),
  title,
  icon: 'Flame',
  description: `Structured firefighter learning path for ${title.toLowerCase()} with lessons, quizzes, and review cards.`,
}))
