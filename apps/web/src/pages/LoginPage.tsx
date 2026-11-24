import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { login } from '../features/auth/api'
import { useAuth } from '../features/auth/auth-context'
import { homePathFor } from '../features/auth/role-home'
import { getErrorMessage } from '../lib/api-error'

export function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (session) => {
      signIn(session)
      navigate(homePathFor(session.user.role), { replace: true })
    },
  })

  if (user && !mutation.isSuccess) return <Navigate to={homePathFor(user.role)} replace />

  const sessionExpired = searchParams.get('sessao') === 'expirada'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    mutation.mutate()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Sistema de Matrícula</h1>
          <p className="text-sm text-slate-600">Entre com seu e-mail institucional.</p>
        </div>

        {sessionExpired && !mutation.isError && (
          <p role="status" className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            Sua sessão expirou. Entre novamente.
          </p>
        )}

        {mutation.isError && (
          <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {getErrorMessage(mutation.error)}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          E-mail
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Senha
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
          />
        </label>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {mutation.isPending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
