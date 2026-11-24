export interface Subject {
  id: number
  code: string
  name: string
  workloadHours: number
}

export interface SubjectInput {
  code: string
  name: string
  workloadHours: number
}
