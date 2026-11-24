import { useState } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '../../components/feedback/EmptyState'
import { ErrorWithRetry } from '../../components/feedback/ErrorWithRetry'
import { FeedbackMessage, type Feedback } from '../../components/feedback/FeedbackMessage'
import { Loading } from '../../components/feedback/Loading'
import { ConfirmableDelete } from '../../components/list/ConfirmableDelete'
import { Pagination } from '../../components/list/Pagination'
import { SearchInput } from '../../components/list/SearchInput'
import { useDeleteSection, useSections } from '../../features/sections/hooks'
import type { Section } from '../../features/sections/types'
import { useListParams } from '../../hooks/use-list-params'
import { getErrorMessage } from '../../lib/api-error'

export function SectionsPage() {
  const { search, page, searchInput, setSearchInput, setPage } = useListParams()
  const { data, isPending, isError, error, refetch, isFetching } = useSections({ search, page })
  const deleteMutation = useDeleteSection()
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const handleDelete = (section: Section) => {
    setFeedback(null)
    deleteMutation.mutate(section.id, {
      onSuccess: () =>
        setFeedback({
          type: 'success',
          message: `Turma ${section.code} de ${section.subject.code} excluída.`,
        }),
      onError: (deleteError) =>
        setFeedback({ type: 'error', message: getErrorMessage(deleteError) }),
    })
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900">Turmas</h1>
        <Link
          to="nova"
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Abrir turma
        </Link>
      </div>

      <div className="max-w-md">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Buscar por disciplina ou professor"
        />
      </div>

      {feedback && <FeedbackMessage feedback={feedback} onDismiss={() => setFeedback(null)} />}

      {isPending && <Loading message="Carregando turmas..." />}

      {isError && (
        <ErrorWithRetry
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      )}

      {data && data.items.length === 0 && (
        <EmptyState
          message={search ? `Nenhuma turma encontrada para "${search}".` : 'Nenhuma turma aberta.'}
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Disciplina</th>
                  <th className="px-4 py-3 font-medium">Turma</th>
                  <th className="px-4 py-3 font-medium">Professor</th>
                  <th className="px-4 py-3 font-medium">Vagas ocupadas / totais</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((section) => {
                  const label = `${section.subject.code} turma ${section.code}`
                  const isFull = section.occupiedSeats >= section.capacity
                  return (
                    <tr key={section.id}>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900">{section.subject.code}</span>{' '}
                        <span className="text-slate-700">{section.subject.name}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-800">{section.code}</td>
                      <td className="px-4 py-3 text-slate-800">{section.professor.name}</td>
                      <td
                        className={`px-4 py-3 ${isFull ? 'font-medium text-red-700' : 'text-slate-800'}`}
                      >
                        {section.occupiedSeats} / {section.capacity}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-4">
                          <Link
                            to={`${section.id}/editar`}
                            aria-label={`Editar ${label}`}
                            className="text-sm font-medium text-blue-700 hover:underline"
                          >
                            Editar
                          </Link>
                          <ConfirmableDelete
                            itemLabel={label}
                            onConfirm={() => handleDelete(section)}
                            disabled={deleteMutation.isPending}
                            isDeleting={
                              deleteMutation.isPending && deleteMutation.variables === section.id
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </section>
  )
}
