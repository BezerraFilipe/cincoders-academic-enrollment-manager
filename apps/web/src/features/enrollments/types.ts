export interface Enrollment {
  id: number
  sectionId: number
  sectionCode: string
  subject: { code: string; name: string; workloadHours: number }
  professorName: string
  createdAt: string
}
