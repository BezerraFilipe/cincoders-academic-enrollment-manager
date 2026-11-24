import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from './auth-context'
import { clearSession, readSession, writeSession } from './session-storage'
import type { AuthUser, Session } from './types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<AuthUser | null>(() => readSession()?.user ?? null)

  const signIn = useCallback((session: Session) => {
    writeSession(session)
    setUser(session.user)
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    queryClient.clear()
    setUser(null)
  }, [queryClient])

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
