import { useState } from 'react'
import type { Enrollment } from './types'

interface EnrollmentCardProps {
  enrollment: Enrollment
  onCancel: (enrollment: Enrollment) => void
  isCancelling: boolean
  isBusy: boolean
}

export function EnrollmentCard({
  enrollment,
  onCancel,
  isCancelling,
  isBusy,
}: EnrollmentCardProps) {
  const [confirming, setConfirming] = useState(false)
  const { subject } = enrollment
  const label = `${subject.code} turma ${enrollment.sectionCode}`

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <p className="text-xs font-medium text-slate-500">
          {subject.code} · Turma {enrollment.sectionCode}
        </p>
        <h2 className="font-semibold text-slate-900">{subject.name}</h2>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-slate-500">Professor</dt>
        <dd className="text-slate-800">{enrollment.professorName}</dd>
        <dt className="text-slate-500">Carga horária</dt>
        <dd className="text-slate-800">{subject.workloadHours}h</dd>
      </dl>

      {confirming ? (
        <div className="flex flex-col gap-2 rounded-md bg-amber-50 p-3">
          <p className="text-sm text-amber-900">Cancelar esta matrícula? A vaga será liberada.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onCancel(enrollment)}
              disabled={isBusy}
              aria-label={`Confirmar cancelamento de ${label}`}
              className="flex-1 rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
            >
              {isCancelling ? 'Cancelando...' : 'Confirmar'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={isCancelling}
              className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            >
              Voltar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={isBusy}
          aria-label={`Cancelar matrícula em ${label}`}
          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          Cancelar matrícula
        </button>
      )}
    </article>
  )
}
