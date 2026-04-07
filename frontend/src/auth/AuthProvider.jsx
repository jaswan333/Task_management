import { useCallback, useMemo, useState } from 'react'
import { AUTH_STORAGE_KEY, AuthContext } from './context.js'
import { API_URL } from '../api/client.js'

function loadSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') return null
    return data
  } catch {
    return null
  }
}

function saveSession(session) {
  if (!session) {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession)

  const login = useCallback(async (email, password) => {
    try {
      console.log('[Auth] Attempting login for:', email)
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('[Auth] Server response status:', response.status)
      console.log('[Auth] Server response data:', data)

      if (!response.ok) {
        return { ok: false, error: data.message || 'Login failed' };
      }

      const next = { 
        role: data.role, 
        memberId: data._id, 
        token: data.token,
        name: data.name
      };
      
      console.log('[Auth] Session saved:', next.role, next.name)
      setSession(next);
      saveSession(next);
      return { ok: true };
    } catch(e) {
      console.error('[Auth] Login fetch error:', e)
      return { ok: false, error: e.message };
    }
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    saveSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAdmin: session?.role === 'admin',
      isMember: session?.role === 'member',
      memberId: session ? session.memberId : null,
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
