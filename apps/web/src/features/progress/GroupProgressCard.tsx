import type { GroupProgress } from './types'

const TITLES: Record<GroupProgress['group'], string> = {
  MANDATORY: 'Obrigatórias',
  PROFILE_ELECTIVE: 'Eletivas de perfil',
  FREE_ELECTIVE: 'Eletivas livres',
}

export function GroupProgressCard({ progress }: { progress: GroupProgress }) {
  const title = TITLES[progress.group]

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <span className="text-sm font-medium text-slate-700">{progress.completionPercentage}%</span>
      </div>

      <div
        role="progressbar"
        aria-label={`Progresso em ${title}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.completionPercentage}
        className="h-2 overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className="h-full rounded-full bg-blue-700"
          style={{ width: `${progress.completionPercentage}%` }}
        />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-slate-500">Exigida</dt>
          <dd className="font-medium text-slate-900">{progress.requiredHours}h</dd>
        </div>
        <div>
          <dt className="text-slate-500">Integralizada</dt>
          <dd className="font-medium text-slate-900">{progress.completedHours}h</dd>
        </div>
        <div>
          <dt className="text-slate-500">Em curso</dt>
          <dd className="font-medium text-slate-900">{progress.inProgressHours}h</dd>
        </div>
        <div>
          <dt className="text-slate-500">Falta</dt>
          <dd className="font-medium text-slate-900">{progress.remainingHours}h</dd>
        </div>
      </dl>
    </article>
  )
}
