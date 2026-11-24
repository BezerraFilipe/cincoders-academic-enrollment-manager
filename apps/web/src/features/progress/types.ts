import type { SubjectCategory } from '../offerings/types'

export interface GroupProgress {
  group: SubjectCategory
  requiredHours: number
  completedHours: number
  inProgressHours: number
  remainingHours: number
  completionPercentage: number
}

export interface Progress {
  course: { code: string; name: string }
  groups: GroupProgress[]
}
