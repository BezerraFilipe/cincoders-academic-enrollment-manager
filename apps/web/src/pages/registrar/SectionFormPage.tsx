import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ErrorWithRetry } from '../../components/feedback/ErrorWithRetry'
import { Loading } from '../../components/feedback/Loading'
import { SelectField } from '../../components/form/SelectField'
import { TextField } from '../../components/form/TextField'
import { useSaveSection, useSection, useSectionFormOptions } from '../../features/sections/hooks'
import type { Section } from '../../features/sections/types'
import {
  validateSection,
  type SectionFormErrors,
  type SectionFormValues,
} from '../../features/sections/validate-section'
import { getApiError, getErrorMessage } from '../../lib/api-error'

const FIELD_BY_ERROR_CODE: Record<string, keyof SectionFormValues> = {
  SECTION_CODE_TAKEN: 'code',
  CAPACITY_BELOW_ENROLLED: 'capacity',
  SECTION_HAS_ENROLLMENTS: 'subjectId',
  SUBJECT_NOT_FOUND: 'subjectId',
  PROFESSOR_NOT_FOUND: 'professorId',
}

export function SectionFormPage() {
  const params = useParams()
  const id = params.id ? Number(params.id) : undefined
  const sectionQuery = useSection(id)
  const { subjects, professors } = useSectionFormOptions()

  const queries = [subjects, professors, ...(id !== undefined ? [sectionQuery] : [])]
  const failed = queries.find((query) => query.isError)

  if (failed) {
    return (
      <ErrorWithRetry
        message={getErrorMessage(failed.error)}
        onRetry={() => queries.forEach((query) => void query.refetch())}
        isRetrying={queries.some((query) => query.isFetching)}
      />
    )
  }
  if (queries.some((query) => query.isPending)) return <Loading message="Carregando turma..." />

  return (
    <SectionForm
      id={id}
      initial={sectionQuery.data}
      subjectOptions={(subjects.data?.items ?? []).map((subject) => ({
        value: String(subject.id),
        label: `${subject.code} - ${subject.name}`,
      }))}
      professorOptions={(professors.data?.items ?? []).map((professor) => ({
        value: String(professor.id),
        label: professor.name,
      }))}
    />
  )
}

interface SectionFormProps {
  id: number | undefined
  initial: Section | undefined
  subjectOptions: { value: string; label: string }[]
  professorOptions: { value: string; label: string }[]
}

function SectionForm({ id, initial, subjectOptions, professorOptions }: SectionFormProps) {
  const navigate = useNavigate()
  const saveMutation = useSaveSection(id)
  const occupiedSeats = initial?.occupiedSeats ?? 0
  const [values, setValues] = useState<SectionFormValues>({
    subjectId: initial ? String(initial.subject.id) : '',
    professorId: initial ? String(initial.professor.id) : '',
    code: initial?.code ?? '',
    capacity: initial ? String(initial.capacity) : '',
  })
  const [errors, setErrors] = useState<SectionFormErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  const setField = (field: keyof SectionFormValues, value: string) =>
    setValues((current) => ({ ...current, [field]: value }))

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setGeneralError(null)

    const validationErrors = validateSection(values, occupiedSeats)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    saveMutation.mutate(
      {
        subjectId: Number(values.subjectId),
        professorId: Number(values.professorId),
        code: values.code.trim().toUpperCase(),
        capacity: Number(values.capacity),
      },
      {
        onSuccess: () => navigate('/secretaria/turmas'),
        onError: (saveError) => {
          const field = FIELD_BY_ERROR_CODE[getApiError(saveError)?.code ?? '']
          if (field) setErrors({ [field]: getErrorMessage(saveError) })
          else setGeneralError(getErrorMessage(saveError))
        },
      },
    )
  }

  return (
    <section className="flex max-w-lg flex-col gap-4">
      <h1 className="text-xl font-semibold text-slate-900">
        {id === undefined
          ? 'Abrir turma'
          : `Editar turma ${initial?.code} de ${initial?.subject.code}`}
      </h1>

      {generalError && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {generalError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <SelectField
          label="Disciplina"
          placeholder="Selecione a disciplina"
          options={subjectOptions}
          value={values.subjectId}
          onChange={(event) => setField('subjectId', event.target.value)}
          disabled={occupiedSeats > 0}
          hint={
            occupiedSeats > 0
              ? 'A disciplina não pode ser trocada porque a turma tem alunos matriculados.'
              : undefined
          }
          error={errors.subjectId}
        />
        <SelectField
          label="Professor"
          placeholder="Selecione o professor"
          options={professorOptions}
          value={values.professorId}
          onChange={(event) => setField('professorId', event.target.value)}
          error={errors.professorId}
        />
        <TextField
          label="Código da turma"
          value={values.code}
          onChange={(event) => setField('code', event.target.value)}
          placeholder="A"
          error={errors.code}
        />
        <TextField
          label="Vagas"
          type="number"
          min={Math.max(1, occupiedSeats)}
          value={values.capacity}
          onChange={(event) => setField('capacity', event.target.value)}
          error={errors.capacity}
        />
        {occupiedSeats > 0 && (
          <p className="text-sm text-slate-600">
            {occupiedSeats} {occupiedSeats === 1 ? 'aluno matriculado' : 'alunos matriculados'}{' '}
            nesta turma.
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
          <Link
            to="/secretaria/turmas"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  )
}
