export interface SectionFormValues {
  subjectId: string
  professorId: string
  code: string
  capacity: string
}

export type SectionFormErrors = Partial<Record<keyof SectionFormValues, string>>

export function validateSection(values: SectionFormValues, occupiedSeats = 0): SectionFormErrors {
  const errors: SectionFormErrors = {}
  const capacity = Number(values.capacity)

  if (!values.subjectId) errors.subjectId = 'Selecione a disciplina.'
  if (!values.professorId) errors.professorId = 'Selecione o professor.'

  if (!/^[A-Za-z0-9]{1,5}$/.test(values.code.trim())) {
    errors.code = 'O código da turma deve ter de 1 a 5 letras ou números.'
  }

  if (!Number.isInteger(capacity) || capacity < 1) {
    errors.capacity = 'A turma deve ter pelo menos 1 vaga.'
  } else if (capacity < occupiedSeats) {
    errors.capacity = `A turma tem ${occupiedSeats} alunos matriculados; as vagas não podem ser menos que isso.`
  }

  return errors
}
