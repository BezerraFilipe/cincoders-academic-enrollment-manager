import { CategoryBadge } from './CategoryBadge'
import type { Offering } from './types'

interface OfferingCardProps {
  offering: Offering
  onEnroll: (offering: Offering) => void
  isEnrolling: boolean
  isBusy: boolean
}

function statusMessage(offering: Offering): string | null {
  if (offering.enrolled) return 'Você está matriculado nesta turma.'
  if (offering.alreadyPassed) return 'Você já foi aprovado nesta disciplina.'
  return null
}

export function OfferingCard({ offering, onEnroll, isEnrolling, isBusy }: OfferingCardProps) {
  const { subject } = offering
  const isFull = offering.availableSeats === 0
  const status = statusMessage(offering)
  const enrolledInAnotherSection = offering.enrolledInSubject && !offering.enrolled
  const hasPendingPrerequisites = offering.missingPrerequisites.length > 0

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {subject.code} · Turma {offering.sectionCode}
          </p>
          <h2 className="font-semibold text-slate-900">{subject.name}</h2>
        </div>
        <CategoryBadge category={offering.category} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-slate-500">Professor</dt>
        <dd className="text-slate-800">{offering.professorName}</dd>
        <dt className="text-slate-500">Carga horária</dt>
        <dd className="text-slate-800">{subject.workloadHours}h</dd>
        <dt className="text-slate-500">Vagas disponíveis</dt>
        <dd className={isFull ? 'font-medium text-red-700' : 'text-slate-800'}>
          {isFull ? 'Lotada' : `${offering.availableSeats} de ${offering.capacity}`}
        </dd>
      </dl>

      {status ? (
        <p className="text-sm font-medium text-green-700">{status}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {hasPendingPrerequisites && (
            <p className="text-sm text-amber-800">
              Pré-requisitos pendentes: {offering.missingPrerequisites.join(', ')}.
            </p>
          )}
          {enrolledInAnotherSection && (
            <p className="text-sm text-slate-600">
              Você já está matriculado em outra turma desta disciplina. Cancele aquela matrícula
              para se matricular nesta.
            </p>
          )}
          <button
            type="button"
            onClick={() => onEnroll(offering)}
            disabled={isBusy || isFull || enrolledInAnotherSection || hasPendingPrerequisites}
            aria-label={`Matricular em ${subject.code} turma ${offering.sectionCode}`}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isEnrolling ? 'Matriculando...' : 'Matricular'}
          </button>
        </div>
      )}
    </article>
  )
}
