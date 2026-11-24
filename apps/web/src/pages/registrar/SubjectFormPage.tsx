import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ErrorWithRetry } from '../../components/feedback/ErrorWithRetry'
import { Loading } from '../../components/feedback/Loading'
import { TextField } from '../../components/form/TextField'
import { useSaveSubject, useSubject } from '../../features/subjects/hooks'
import type { Subject } from '../../features/subjects/types'
import {
  validateSubject,
  type SubjectFormErrors,
  type SubjectFormValues,
} from '../../features/subjects/validate-subject'
import { getApiError, getErrorMessage } from '../../lib/api-error'

export function SubjectFormPage() {
  const params = useParams()
  const id = params.id ? Number(params.id) : undefined
  const subjectQuery = useSubject(id)

  if (id !== undefined && subjectQuery.isPending)
    return <Loading message="Carregando disciplina..." />
  if (id !== undefined && subjectQuery.isError) {
    return (
      <ErrorWithRetry
        message={getErrorMessage(subjectQuery.error)}
        onRetry={() => void subjectQuery.refetch()}
        isRetrying={subjectQuery.isFetching}
      />
    )
  }

  return <SubjectForm id={id} initial={subjectQuery.data} />
}

function SubjectForm({ id, initial }: { id: number | undefined; initial: Subject | undefined }) {
  const navigate = useNavigate()
  const saveMutation = useSaveSubject(id)
  const [values, setValues] = useState<SubjectFormValues>({
    code: initial?.code ?? '',
    name: initial?.name ?? '',
    workloadHours: initial ? String(initial.workloadHours) : '',
  })
  const [errors, setErrors] = useState<SubjectFormErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  const setField = (field: keyof SubjectFormValues) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }))

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setGeneralError(null)

    const validationErrors = validateSubject(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    saveMutation.mutate(
      {
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        workloadHours: Number(values.workloadHours),
      },
      {
        onSuccess: () => navigate('/secretaria/disciplinas'),
        onError: (saveError) => {
          if (getApiError(saveError)?.code === 'SUBJECT_CODE_TAKEN') {
            setErrors({ code: getErrorMessage(saveError) })
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
        {id === undefined ? 'Nova disciplina' : `Editar disciplina ${initial?.code}`}
      </h1>

      {generalError && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {generalError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label="Código"
          value={values.code}
          onChange={(event) => setField('code')(event.target.value)}
          error={errors.code}
          placeholder="IF668"
        />
        <TextField
          label="Nome"
          value={values.name}
          onChange={(event) => setField('name')(event.target.value)}
          error={errors.name}
        />
        <TextField
          label="Carga horária (h)"
          type="number"
          step={15}
          min={15}
          max={120}
          value={values.workloadHours}
          onChange={(event) => setField('workloadHours')(event.target.value)}
          error={errors.workloadHours}
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
            to="/secretaria/disciplinas"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  )
}
