export type UserRole = 'REGISTRAR' | 'STUDENT'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface StudentProfile {
  registrationNumber: string
  course: { code: string; name: string }
}

export interface CurrentUser extends AuthUser {
  student?: StudentProfile
}

export interface Session {
  accessToken: string
  user: AuthUser
}
