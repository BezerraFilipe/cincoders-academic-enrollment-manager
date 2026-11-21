import { ErrorWithRetry } from '../components/feedback/ErrorWithRetry'
import { Loading } from '../components/feedback/Loading'
import { useHealth } from '../features/health/use-health'

export function HomePage() {
  const { data, isPending, isError, refetch, isFetching } = useHealth()

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Sistema de Matrícula</h1>

      {isPending && <Loading message="Verificando o servidor..." />}

      {isError && <ErrorWithRetry onRetry={() => void refetch()} isRetrying={isFetching} />}

      {data && (
        <dl className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white p-4">
          <dt className="text-slate-600">API</dt>
          <dd className="font-medium text-green-700">
            {data.status === 'ok' ? 'Online' : data.status}
          </dd>
          <dt className="text-slate-600">Banco de dados</dt>
          <dd className="font-medium text-green-700">
            {data.database === 'up' ? 'Online' : data.database}
          </dd>
        </dl>
      )}
    </main>
  )
}
