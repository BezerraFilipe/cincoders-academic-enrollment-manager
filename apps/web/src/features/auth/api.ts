import { apiClient } from '../../lib/api-client'
import type { CurrentUser, Session } from './types'

export async function login(email: string, password: string): Promise<Session> {
  const { data } = await apiClient.post<Session>('/auth/login', { email, password })
  return data
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await apiClient.get<CurrentUser>('/auth/me')
  return data
}
