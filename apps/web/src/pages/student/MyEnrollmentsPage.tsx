import { useState } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '../../components/feedback/EmptyState'
import { ErrorWithRetry } from '../../components/feedback/ErrorWithRetry'
import { FeedbackMessage, type Feedback } from '../../components/feedback/FeedbackMessage'
import { Loading } from '../../components/feedback/Loading'
import { EnrollmentCard } from '../../features/enrollments/EnrollmentCard'
import type { Enrollment } from '../../features/enrollments/types'
import { useCancelEnrollment } from '../../features/enrollments/use-cancel-enrollment'
import { useMyEnrollments } from '../../features/enrollments/use-my-enrollments'
import { getErrorMessage } from '../../lib/api-error'

export function MyEnrollmentsPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useMyEnrollments()
  const cancelMutation = useCancelEnrollment()
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const handleCancel = (enrollment: Enrollment) => {
    setFeedback(null)
    cancelMutation.mutate(enrollment.id, {
      onSuccess: () =>
        setFeedback({
          type: 'success',
          message: `Matrícula em ${enrollment.subject.code} cancelada. A vaga foi liberada.`,
        }),
      onError: (cancelError) =>
        setFeedback({ type: 'error', message: getErrorMessage(cancelError) }),
    })
  }

  const totalHours = data?.reduce((sum, enrollment) => sum + enrollment.subject.workloadHours, 0)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold text-slate-900">Minhas matrículas</h1>
        {data && data.length > 0 && (
          <p className="text-sm text-slate-600">
            {data.length} {data.length === 1 ? 'disciplina' : 'disciplinas'} · {totalHours}h em
            curso
          </p>
        )}
      </div>

      {feedback && <FeedbackMessage feedback={feedback} onDismiss={() => setFeedback(null)} />}

      {isPending && <Loading message="Carregando matrículas..." />}

      {isError && (
        <ErrorWithRetry
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      )}

      {data && data.length === 0 && (
        <div className="flex flex-col items-center gap-3">
          <EmptyState message="Você não tem matrículas ativas neste semestre." />
          <Link to="/aluno/ofertas" className="text-sm font-medium text-blue-700 underline">
            Ver ofertas do semestre
          </Link>
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.map((enrollment) => (
            <li key={enrollment.id}>
              <EnrollmentCard
                enrollment={enrollment}
                onCancel={handleCancel}
                isBusy={cancelMutation.isPending}
                isCancelling={
                  cancelMutation.isPending && cancelMutation.variables === enrollment.id
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
