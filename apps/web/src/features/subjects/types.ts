export interface PrerequisiteSummary {
  id: number
  code: string
  name: string
}

export interface Subject {
  id: number
  code: string
  name: string
  workloadHours: number
  prerequisites: PrerequisiteSummary[]
}

export interface SubjectInput {
  code: string
  name: string
  workloadHours: number
  prerequisiteIds: number[]
}
