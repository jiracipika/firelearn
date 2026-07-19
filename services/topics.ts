import { categories } from '@/data/categories'

/**
 * Human-readable display labels for the topic slugs used in
 * `QuizQuestion.topicIds` and `Flashcard.topicIds`.
 *
 * Most topic IDs are also valid category slugs (they share the
 * `slugify(title)` derivation in `data/categories.ts`), so the category
 * catalog is the canonical source for those labels. The overrides below cover
 * slugs that are not present as categories (for example acronyms whose proper
 * capitalization differs from title case) and the handful of compound slugs
 * that appear in quiz/exam seeds.
 *
 * Keeping this single source of truth avoids the scattered raw-kebab-case
 * rendering that used to surface "mayday-procedures · 2" on the dashboard and
 * "scba" on quiz result chips.
 */
const TOPIC_LABEL_OVERRIDES: Record<string, string> = {
  scba: 'SCBA',
  ppe: 'PPE',
  'mayday-procedures': 'Mayday Procedures',
  'fire-behaviour': 'Fire Behaviour',
  'fire-dynamics': 'Fire Dynamics',
  'search-and-rescue': 'Search & Rescue',
  'incident-command': 'Incident Command',
  'forcible-entry': 'Forcible Entry',
  'hazmat-awareness': 'Hazmat Awareness',
  'electric-vehicle-incidents': 'Electric Vehicle Incidents',
  'cancer-prevention-and-decon': 'Cancer Prevention & Decon',
  'firefighter-rehab': 'Firefighter Rehab',
  'water-supply': 'Water Supply',
  'fire-streams': 'Fire Streams',
}

const categoryLabelsBySlug = new Map(categories.map((category) => [category.id, category.title]))

/**
 * Convert an arbitrary kebab-case topic id into a best-effort title-cased
 * label. Used only as a fallback when the id is neither a category slug nor a
 * known override (e.g. a future topic added before this registry is updated).
 *
 * "fire-streams" → "Fire Streams", "scba" → "Scba" (then overridden upstream).
 */
function titleCaseSlug(slug: string): string {
  return slug
    .split('-')
    .map((part) => (part.length === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join(' ')
}

export function formatTopicLabel(topicId: string): string {
  if (!topicId) return topicId
  if (TOPIC_LABEL_OVERRIDES[topicId]) return TOPIC_LABEL_OVERRIDES[topicId]
  const categoryLabel = categoryLabelsBySlug.get(topicId)
  if (categoryLabel) return categoryLabel
  return titleCaseSlug(topicId)
}

export function formatTopicLabels(topicIds: ReadonlyArray<string>): string[] {
  return topicIds.map(formatTopicLabel)
}

/**
 * Return the most user-readable identifier for a topic id. Today this matches
 * {@link formatTopicLabel}; the separate name exists so call sites can express
 * intent ("I want the short name for a heading") and so a future compact form
 * (e.g. "SCBA" vs "Self-Contained Breathing Apparatus") can diverge without
 * touching every caller.
 */
export function getTopicShortName(topicId: string): string {
  return formatTopicLabel(topicId)
}
