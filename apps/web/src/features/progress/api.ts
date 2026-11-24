import { apiClient } from '../../lib/api-client'
import type { Progress } from './types'

export async function getMyProgress(): Promise<Progress> {
  const { data } = await apiClient.get<Progress>('/me/progress')
  return data
}
