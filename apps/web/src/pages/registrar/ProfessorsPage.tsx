import { useState } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '../../components/feedback/EmptyState'
import { ErrorWithRetry } from '../../components/feedback/ErrorWithRetry'
import { FeedbackMessage, type Feedback } from '../../components/feedback/FeedbackMessage'
import { Loading } from '../../components/feedback/Loading'
import { ConfirmableDelete } from '../../components/list/ConfirmableDelete'
import { Pagination } from '../../components/list/Pagination'
import { SearchInput } from '../../components/list/SearchInput'
import { useDeleteProfessor, useProfessors } from '../../features/professors/hooks'
import type { Professor } from '../../features/professors/types'
import { useListParams } from '../../hooks/use-list-params'
import { getErrorMessage } from '../../lib/api-error'

export function ProfessorsPage() {
  const { search, page, searchInput, setSearchInput, setPage } = useListParams()
  const { data, isPending, isError, error, refetch, isFetching } = useProfessors({ search, page })
  const deleteMutation = useDeleteProfessor()
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const handleDelete = (professor: Professor) => {
    setFeedback(null)
    deleteMutation.mutate(professor.id, {
      onSuccess: () =>
        setFeedback({ type: 'success', message: `Professor ${professor.name} excluído.` }),
      onError: (deleteError) =>
        setFeedback({ type: 'error', message: getErrorMessage(deleteError) }),
    })
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900">Professores</h1>
        <Link
          to="novo"
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Novo professor
        </Link>
      </div>

      <div className="max-w-md">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Buscar por nome ou e-mail"
        />
      </div>

      {feedback && <FeedbackMessage feedback={feedback} onDismiss={() => setFeedback(null)} />}

      {isPending && <Loading message="Carregando professores..." />}

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
              ? `Nenhum professor encontrado para "${search}".`
              : 'Nenhum professor cadastrado.'
          }
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((professor) => (
                  <tr key={professor.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{professor.name}</td>
                    <td className="px-4 py-3 text-slate-800">{professor.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-4">
                        <Link
                          to={`${professor.id}/editar`}
                          aria-label={`Editar ${professor.name}`}
                          className="text-sm font-medium text-blue-700 hover:underline"
                        >
                          Editar
                        </Link>
                        <ConfirmableDelete
                          itemLabel={professor.name}
                          onConfirm={() => handleDelete(professor)}
                          disabled={deleteMutation.isPending}
                          isDeleting={
                            deleteMutation.isPending && deleteMutation.variables === professor.id
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </section>
  )
}
