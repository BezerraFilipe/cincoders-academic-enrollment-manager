export type UserRole = 'REGISTRAR' | 'STUDENT'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface Session {
  accessToken: string
  user: AuthUser
}
