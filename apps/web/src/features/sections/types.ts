export interface Section {
  id: number
  code: string
  subject: { id: number; code: string; name: string }
  professor: { id: number; name: string }
  capacity: number
  occupiedSeats: number
}

export interface SectionInput {
  subjectId: number
  professorId: number
  code: string
  capacity: number
}
