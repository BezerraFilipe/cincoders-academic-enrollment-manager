import type { UserRole } from './types'

const HOME_BY_ROLE: Record<UserRole, string> = {
  REGISTRAR: '/secretaria',
  STUDENT: '/aluno',
}

export function homePathFor(role: UserRole): string {
  return HOME_BY_ROLE[role]
}
