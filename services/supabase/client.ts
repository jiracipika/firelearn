import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type FireLearnDatabase = {
  public: {
    Tables: {
      lesson_completions: {
        Row: {
          id: string
          user_id: string
          course_id: string
          lesson_id: string
          xp_awarded: number
          completed_at: string
          client_mutation_id: string | null
          created_at: string
        }
        Insert: {
          user_id?: string
          course_id: string
          lesson_id: string
          xp_awarded?: number
          completed_at?: string
          client_mutation_id?: string
        }
        Update: Partial<FireLearnDatabase['public']['Tables']['lesson_completions']['Insert']>
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          score_percent: number
          weak_topic_ids: string[]
          completed_at: string
          client_mutation_id: string | null
          created_at: string
        }
        Insert: {
          user_id?: string
          quiz_id: string
          score_percent: number
          weak_topic_ids?: string[]
          completed_at: string
          client_mutation_id?: string
        }
        Update: Partial<FireLearnDatabase['public']['Tables']['quiz_attempts']['Insert']>
      }
      flashcard_reviews: {
        Row: {
          id: string
          user_id: string
          card_id: string
          rating: 'again' | 'hard' | 'good' | 'easy'
          ease_factor: number
          interval_days: number
          review_count: number
          next_review: string
          reviewed_at: string
          client_mutation_id: string | null
          created_at: string
        }
        Insert: {
          user_id?: string
          card_id: string
          rating: 'again' | 'hard' | 'good' | 'easy'
          ease_factor: number
          interval_days: number
          review_count: number
          next_review: string
          reviewed_at: string
          client_mutation_id?: string
        }
        Update: Partial<FireLearnDatabase['public']['Tables']['flashcard_reviews']['Insert']>
      }
    }
  }
}

export type FireLearnSupabaseClient = SupabaseClient

export function getSupabaseBrowserKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
}

export function hasSupabaseBrowserEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabaseBrowserKey())
}

export function getSupabaseProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return undefined
  try {
    return new URL(url).hostname.split('.')[0]
  } catch {
    return undefined
  }
}

export function createFireLearnBrowserSupabaseClient(): FireLearnSupabaseClient | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = getSupabaseBrowserKey()
  if (!url || !key) return undefined
  return createClient(url, key)
}
