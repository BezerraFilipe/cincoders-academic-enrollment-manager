import type { SubjectCategory } from './types'

const LABELS: Record<SubjectCategory, string> = {
  MANDATORY: 'Obrigatória',
  PROFILE_ELECTIVE: 'Eletiva de perfil',
  FREE_ELECTIVE: 'Eletiva livre',
}

const STYLES: Record<SubjectCategory, string> = {
  MANDATORY: 'bg-blue-50 text-blue-800',
  PROFILE_ELECTIVE: 'bg-violet-50 text-violet-800',
  FREE_ELECTIVE: 'bg-slate-100 text-slate-700',
}

export function CategoryBadge({ category }: { category: SubjectCategory }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[category]}`}>
      {LABELS[category]}
    </span>
  )
}
