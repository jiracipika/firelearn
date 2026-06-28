'use client'

import * as React from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type AuthContextValue = {
  user: User | null
  loading: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createClient(), [])
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
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

  const signIn = React.useCallback(async () => {
    setError(null)
    setLoading(true)
    const { error: signInError } = await supabase.auth.signInAnonymously()
    if (signInError) {
      setError(
        signInError.message.toLowerCase().includes('disabled')
          ? 'Anonymous sign-ins are disabled. Enable them in Supabase: Authentication → Providers → Anonymous Sign-Ins.'
          : signInError.message,
      )
    }
    setLoading(false)
  }, [supabase])

  const signOut = React.useCallback(async () => {
    setError(null)
    await supabase.auth.signOut()
    setUser(null)
  }, [supabase])

  const value = React.useMemo(
    () => ({ user, loading, error, signIn, signOut }),
    [user, loading, error, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
