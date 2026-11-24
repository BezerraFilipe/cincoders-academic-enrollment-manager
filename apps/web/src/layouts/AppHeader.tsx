import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../features/auth/auth-context'

interface AppHeaderProps {
  title: string
  details?: ReactNode
}

export function AppHeader({ title, details }: AppHeaderProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
        <p className="truncate font-semibold text-slate-900">{user?.name}</p>
        {details}
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
      >
        Sair
      </button>
    </header>
  )
}
