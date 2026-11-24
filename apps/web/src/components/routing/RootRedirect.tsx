import { Navigate } from 'react-router'
import { useAuth } from '../../features/auth/auth-context'
import { homePathFor } from '../../features/auth/role-home'

export function RootRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? homePathFor(user.role) : '/login'} replace />
}
