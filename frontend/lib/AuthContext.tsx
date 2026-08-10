"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = { id: string; email: string; role?: string } | null

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  function broadcastAuthChange() {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new Event('auth-change'))
    try {
      window.localStorage.setItem('auth-event', Date.now().toString())
    } catch (err) {
      // ignore localStorage failures in private mode
    }
  }

  async function refreshUser() {
    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${backend}/api/auth/me`, { credentials: 'include' })
      const j = await res.json().catch(() => ({}))
      if (j?.authenticated && j?.user) {
        setUser(j.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Failed to refresh user session', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  useEffect(() => {
    const handleAuthChange = () => {
      setLoading(true)
      refreshUser()
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'auth-event') {
        setLoading(true)
        refreshUser()
      }
    }

    window.addEventListener('auth-change', handleAuthChange)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  async function login(email: string, password: string) {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const res = await fetch(`${backend}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })
    const j = await res.json().catch(() => ({}))
    if (res.ok && j?.user) {
      try {
        const meRes = await fetch(`${backend}/api/auth/me`, { credentials: 'include' })
        const meJson = await meRes.json().catch(() => ({}))
        if (meJson?.authenticated && meJson?.user) setUser(meJson.user)
        else setUser(j.user)
      } catch (err) {
        console.error('fetchMe after login failed', err)
        setUser(j.user)
      }

      broadcastAuthChange()
      if (j.user.role === 'admin') router.push('/admin')
      else router.push('/')
      return { ok: true, user: j.user }
    }
    return { ok: false, error: j?.error || 'Login failed' }
  }

  async function register(payload: { username: string; email: string; password: string }) {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const res = await fetch(`${backend}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
    const j = await res.json().catch(() => ({}))
    if (res.ok && j?.user) {
      router.push('/login')
      return { ok: true, user: j.user }
    }
    return { ok: false, error: j?.error || 'Register failed' }
  }

  async function logout() {
    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      await fetch(`${backend}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (e) {
      console.error('Logout failed', e)
    }

    setUser(null)
    broadcastAuthChange()
    window.location.href = '/'
  }

  const currentUser = user
  const admin = Boolean(user?.role === 'admin')
  const isAuthenticated = Boolean(user)
  const refreshSession = refreshUser
  const refresh = refreshUser

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser,
        admin,
        isAuthenticated,
        loading,
        login,
        logout,
        register,
        refresh,
        refreshUser,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
