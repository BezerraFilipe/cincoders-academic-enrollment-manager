import { apiClient } from '../../lib/api-client'
import type { Session } from './types'

export async function login(email: string, password: string): Promise<Session> {
  const { data } = await apiClient.post<Session>('/auth/login', { email, password })
  return data
}
