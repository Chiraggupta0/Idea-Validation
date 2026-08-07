import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

/** Auth backed by Supabase. `user` is the row from public.profiles (has role, name, mentor_id…). */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadProfile(id) {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
      if (!active) return
      setUser(data ?? null)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user.id)
      else if (active) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadProfile(session.user.id)
      else if (active) {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  /** Sign up with email/password. Only name/startup go into user metadata — the
   *  DB trigger decides role and institution from a pending invitation or the
   *  email domain. Role is deliberately NOT sent: it is client-controlled data
   *  and must never determine privileges. */
  async function signup({ name, email, password, startup }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, startup: startup || null } },
    })
    if (error) throw new Error(error.message)
    if (!data.session) {
      throw new Error('Check your inbox to confirm your email, then log in.')
    }
    return data
  }

  async function login({ email, password, role }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
    if (role && profile && profile.role !== role) {
      await supabase.auth.signOut()
      throw new Error(`This is a ${profile.role} account — use the ${profile.role} login.`)
    }
    return profile
  }

  /** OAuth: 'azure' = Microsoft, 'google' = Google. */
  async function loginWithProvider(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/login` },
    })
    if (error) throw new Error(error.message)
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  async function updateProfile(patch) {
    if (!user) return
    const { data, error } = await supabase.from('profiles').update(patch).eq('id', user.id).select().single()
    if (error) throw new Error(error.message)
    setUser(data)
    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, loginWithProvider, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
