import { useState } from 'react'
import { EmptyState } from '../../components/feedback/EmptyState'
import { ErrorWithRetry } from '../../components/feedback/ErrorWithRetry'
import { FeedbackMessage, type Feedback } from '../../components/feedback/FeedbackMessage'
import { Loading } from '../../components/feedback/Loading'
import { Pagination } from '../../components/list/Pagination'
import { SearchInput } from '../../components/list/SearchInput'
import { useEnroll } from '../../features/enrollments/use-enroll'
import { OfferingCard } from '../../features/offerings/OfferingCard'
import type { Offering } from '../../features/offerings/types'
import { useOfferings } from '../../features/offerings/use-offerings'
import { useListParams } from '../../hooks/use-list-params'
import { getErrorMessage } from '../../lib/api-error'

export function OfferingsPage() {
  const { search, page, searchInput, setSearchInput, setPage } = useListParams()
  const { data, isPending, isError, error, refetch, isFetching } = useOfferings({ search, page })
  const enrollMutation = useEnroll()
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const handleEnroll = (offering: Offering) => {
    setFeedback(null)
    enrollMutation.mutate(offering.sectionId, {
      onSuccess: () =>
        setFeedback({
          type: 'success',
          message: `Matrícula realizada em ${offering.subject.code} - ${offering.subject.name} (turma ${offering.sectionCode}).`,
        }),
      onError: (enrollError) =>
        setFeedback({ type: 'error', message: getErrorMessage(enrollError) }),
    })
  }

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-slate-900">Ofertas do semestre</h1>

      <SearchInput
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Buscar por código ou nome da disciplina"
      />

      {feedback && <FeedbackMessage feedback={feedback} onDismiss={() => setFeedback(null)} />}

      {isPending && <Loading message="Carregando ofertas..." />}

      {isError && (
        <ErrorWithRetry
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      )}

      {data && data.items.length === 0 && (
        <EmptyState
          message={
            search
              ? `Nenhuma turma encontrada para "${search}".`
              : 'Nenhuma turma ofertada neste semestre.'
          }
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <ul className="flex flex-col gap-3">
            {data.items.map((offering) => (
              <li key={offering.sectionId}>
                <OfferingCard
                  offering={offering}
                  onEnroll={handleEnroll}
                  isBusy={enrollMutation.isPending}
                  isEnrolling={
                    enrollMutation.isPending && enrollMutation.variables === offering.sectionId
                  }
                />
              </li>
            ))}
          </ul>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </section>
  )
}
