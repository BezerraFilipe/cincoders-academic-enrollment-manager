import { createContext, useContext } from 'react'
import type { AuthUser, Session } from './types'

export interface AuthContextValue {
  user: AuthUser | null
  signIn: (session: Session) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
