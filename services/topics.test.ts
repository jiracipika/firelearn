import { describe, expect, it } from 'vitest'
import { formatTopicLabel, formatTopicLabels, getTopicShortName } from '@/services/topics'

describe('formatTopicLabel', () => {
  it('renders known acronym overrides with proper capitalization', () => {
    expect(formatTopicLabel('scba')).toBe('SCBA')
    expect(formatTopicLabel('ppe')).toBe('PPE')
  })

  it('renders compound firefighter terms in title case', () => {
    expect(formatTopicLabel('mayday-procedures')).toBe('Mayday Procedures')
    expect(formatTopicLabel('fire-behaviour')).toBe('Fire Behaviour')
    expect(formatTopicLabel('search-and-rescue')).toBe('Search & Rescue')
    expect(formatTopicLabel('cancer-prevention-and-decon')).toBe('Cancer Prevention & Decon')
  })

  it('prefers the category catalog title when the id is a category slug', () => {
    // Both topics appear as categories in data/categories.ts; their canonical
    // titles should win over a generic title-case fallback.
    expect(formatTopicLabel('ladders')).toBe('Ladders')
    expect(formatTopicLabel('ventilation')).toBe('Ventilation')
    expect(formatTopicLabel('incident-command')).toBe('Incident Command')
  })

  it('title-cases unknown slugs instead of returning raw kebab-case', () => {
    expect(formatTopicLabel('brand-new-topic')).toBe('Brand New Topic')
    expect(formatTopicLabel('single')).toBe('Single')
  })

  it('passes empty strings through unchanged', () => {
    expect(formatTopicLabel('')).toBe('')
  })
})

describe('formatTopicLabels', () => {
  it('maps an array of topic ids preserving order', () => {
    expect(formatTopicLabels(['scba', 'mayday-procedures', 'unknown-thing'])).toEqual([
      'SCBA',
      'Mayday Procedures',
      'Unknown Thing',
    ])
  })

  it('returns an empty array for an empty input', () => {
    expect(formatTopicLabels([])).toEqual([])
  })
})

describe('getTopicShortName', () => {
  it('matches formatTopicLabel for the current registry', () => {
    expect(getTopicShortName('scba')).toBe('SCBA')
    expect(getTopicShortName('fire-dynamics')).toBe('Fire Dynamics')
  })
})
