import { describe, expect, it, vi } from 'vitest'
import { getSupabaseProjectRef } from '@/services/supabase/client'

describe('Supabase browser client config', () => {
  it('extracts the project ref from the configured Supabase URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://iwcalmxtokxohdgemwjs.supabase.co')
    expect(getSupabaseProjectRef()).toBe('iwcalmxtokxohdgemwjs')
    vi.unstubAllEnvs()
  })
})
