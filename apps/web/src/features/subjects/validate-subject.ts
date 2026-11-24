export interface SubjectFormValues {
  code: string
  name: string
  workloadHours: string
}

export type SubjectFormErrors = Partial<Record<keyof SubjectFormValues, string>>

export function validateSubject(values: SubjectFormValues): SubjectFormErrors {
  const errors: SubjectFormErrors = {}
  const code = values.code.trim().toUpperCase()
  const name = values.name.trim()
  const workloadHours = Number(values.workloadHours)

  if (!/^[A-Z0-9]{3,10}$/.test(code)) {
    errors.code = 'O código deve ter de 3 a 10 letras ou números, sem espaços.'
  }

  if (name.length < 3 || name.length > 150) {
    errors.name = 'O nome deve ter entre 3 e 150 caracteres.'
  }

  if (
    !Number.isInteger(workloadHours) ||
    workloadHours < 15 ||
    workloadHours > 120 ||
    workloadHours % 15 !== 0
  ) {
    errors.workloadHours = 'A carga horária deve ser múltipla de 15, entre 15h e 120h.'
  }

  return errors
}
