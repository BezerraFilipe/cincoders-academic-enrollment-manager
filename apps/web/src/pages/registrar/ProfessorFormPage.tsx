import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ErrorWithRetry } from '../../components/feedback/ErrorWithRetry'
import { Loading } from '../../components/feedback/Loading'
import { TextField } from '../../components/form/TextField'
import { useProfessor, useSaveProfessor } from '../../features/professors/hooks'
import type { Professor } from '../../features/professors/types'
import {
  validateProfessor,
  type ProfessorFormErrors,
  type ProfessorFormValues,
} from '../../features/professors/validate-professor'
import { getApiError, getErrorMessage } from '../../lib/api-error'

export function ProfessorFormPage() {
  const params = useParams()
  const id = params.id ? Number(params.id) : undefined
  const professorQuery = useProfessor(id)

  if (id !== undefined && professorQuery.isPending) {
    return <Loading message="Carregando professor..." />
  }
  if (id !== undefined && professorQuery.isError) {
    return (
      <ErrorWithRetry
        message={getErrorMessage(professorQuery.error)}
        onRetry={() => void professorQuery.refetch()}
        isRetrying={professorQuery.isFetching}
      />
    )
  }

  return <ProfessorForm id={id} initial={professorQuery.data} />
}

function ProfessorForm({
  id,
  initial,
}: {
  id: number | undefined
  initial: Professor | undefined
}) {
  const navigate = useNavigate()
  const saveMutation = useSaveProfessor(id)
  const [values, setValues] = useState<ProfessorFormValues>({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
  })
  const [errors, setErrors] = useState<ProfessorFormErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setGeneralError(null)

    const validationErrors = validateProfessor(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    saveMutation.mutate(
      { name: values.name.trim(), email: values.email.trim().toLowerCase() },
      {
        onSuccess: () => navigate('/secretaria/professores'),
        onError: (saveError) => {
          if (getApiError(saveError)?.code === 'PROFESSOR_EMAIL_TAKEN') {
            setErrors({ email: getErrorMessage(saveError) })
          } else {
            setGeneralError(getErrorMessage(saveError))
          }
        },
      },
    )
  }

  return (
    <section className="flex max-w-lg flex-col gap-4">
      <h1 className="text-xl font-semibold text-slate-900">
        {id === undefined ? 'Novo professor' : `Editar ${initial?.name}`}
      </h1>

      {generalError && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {generalError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label="Nome"
          value={values.name}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          error={errors.name}
        />
        <TextField
          label="E-mail"
          type="email"
          value={values.email}
          onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
          error={errors.email}
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
          <Link
            to="/secretaria/professores"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  )
}
