'use client'

import * as React from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

type AuthContextValue = {
  user: User | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

const NOT_CONFIGURED = { error: 'Supabase is not configured.' }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured()
  const supabase = React.useMemo(() => (configured ? createClient() : null), [configured])
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user ?? null)
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signInWithEmail = React.useCallback(
    async (email: string, password: string) => {
      if (!supabase) return NOT_CONFIGURED
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      return { error: null }
    },
    [supabase],
  )

  const signUpWithEmail = React.useCallback(
    async (email: string, password: string) => {
      if (!supabase) return NOT_CONFIGURED
      const redirectTo =
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${window.location.origin}/auth/callback`

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      })
      if (error) return { error: error.message }
      return { error: null }
    },
    [supabase],
  )

  const signOut = React.useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
  }, [supabase])

  const value = React.useMemo(
    () => ({ user, loading, signInWithEmail, signUpWithEmail, signOut }),
    [user, loading, signInWithEmail, signUpWithEmail, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
