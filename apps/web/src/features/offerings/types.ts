export type SubjectCategory = 'MANDATORY' | 'PROFILE_ELECTIVE' | 'FREE_ELECTIVE'

export interface Offering {
  sectionId: number
  sectionCode: string
  subject: { id: number; code: string; name: string; workloadHours: number }
  professorName: string
  capacity: number
  occupiedSeats: number
  availableSeats: number
  category: SubjectCategory
  enrolled: boolean
  enrolledInSubject: boolean
  alreadyPassed: boolean
}
