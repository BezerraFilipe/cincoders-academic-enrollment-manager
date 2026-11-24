export interface ProfessorFormValues {
  name: string
  email: string
}

export type ProfessorFormErrors = Partial<Record<keyof ProfessorFormValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateProfessor(values: ProfessorFormValues): ProfessorFormErrors {
  const errors: ProfessorFormErrors = {}
  const name = values.name.trim()

  if (name.length < 3 || name.length > 120) {
    errors.name = 'O nome deve ter entre 3 e 120 caracteres.'
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Informe um e-mail válido.'
  }

  return errors
}
