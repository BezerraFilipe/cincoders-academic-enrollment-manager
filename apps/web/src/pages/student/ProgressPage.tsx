import { ErrorWithRetry } from '../../components/feedback/ErrorWithRetry'
import { Loading } from '../../components/feedback/Loading'
import { GroupProgressCard } from '../../features/progress/GroupProgressCard'
import { useMyProgress } from '../../features/progress/use-my-progress'
import { getErrorMessage } from '../../lib/api-error'

export function ProgressPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useMyProgress()

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Progresso no curso</h1>
        {data && <p className="text-sm text-slate-600">{data.course.name}</p>}
      </div>

      {isPending && <Loading message="Calculando progresso..." />}

      {isError && (
        <ErrorWithRetry
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      )}

      {data && (
        <>
          <ul className="flex flex-col gap-3">
            {data.groups.map((group) => (
              <li key={group.group}>
                <GroupProgressCard progress={group} />
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">
            Só disciplinas aprovadas contam como carga horária integralizada; as matrículas ativas
            aparecem como em curso. A carga de eletivas de perfil que excede o exigido conta como
            eletiva livre.
          </p>
        </>
      )}
    </section>
  )
}
