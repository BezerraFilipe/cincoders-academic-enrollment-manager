import { CategoryBadge } from './CategoryBadge'
import type { Offering } from './types'

export function OfferingCard({ offering }: { offering: Offering }) {
  const { subject } = offering
  const isFull = offering.availableSeats === 0

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

      {(offering.enrolled || offering.alreadyPassed) && (
        <p className="text-sm font-medium text-green-700">
          {offering.enrolled
            ? 'Você está matriculado nesta turma.'
            : 'Você já foi aprovado nesta disciplina.'}
        </p>
      )}
    </article>
  )
}
