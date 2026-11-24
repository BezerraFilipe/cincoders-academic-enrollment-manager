import { apiClient } from '../../lib/api-client'
import type { Enrollment } from './types'

export async function listMyEnrollments(): Promise<Enrollment[]> {
  const { data } = await apiClient.get<Enrollment[]>('/me/enrollments')
  return data
}

export async function enroll(sectionId: number): Promise<Enrollment> {
  const { data } = await apiClient.post<Enrollment>('/me/enrollments', { sectionId })
  return data
}

export async function cancelEnrollment(enrollmentId: number): Promise<void> {
  await apiClient.delete(`/me/enrollments/${enrollmentId}`)
}
