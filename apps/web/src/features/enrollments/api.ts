import { apiClient } from '../../lib/api-client'
import type { Enrollment } from './types'

export async function enroll(sectionId: number): Promise<Enrollment> {
  const { data } = await apiClient.post<Enrollment>('/me/enrollments', { sectionId })
  return data
}
