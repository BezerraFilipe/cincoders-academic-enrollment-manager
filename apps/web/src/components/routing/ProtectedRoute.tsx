import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../../features/auth/auth-context'
import { homePathFor } from '../../features/auth/role-home'
import type { UserRole } from '../../features/auth/types'

interface ProtectedRouteProps {
  role: UserRole
  children: ReactNode
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={homePathFor(user.role)} replace />

  return children
}
