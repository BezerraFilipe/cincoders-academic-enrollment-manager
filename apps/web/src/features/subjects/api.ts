import { apiClient } from '../../lib/api-client'
import type { Page } from '../../lib/page'
import type { Subject, SubjectInput } from './types'

export const SUBJECTS_PAGE_SIZE = 10

export async function listSubjects(params: {
  search: string
  page: number
}): Promise<Page<Subject>> {
  const { data } = await apiClient.get<Page<Subject>>('/subjects', {
    params: { search: params.search || undefined, page: params.page, pageSize: SUBJECTS_PAGE_SIZE },
  })
  return data
}

export async function getSubject(id: number): Promise<Subject> {
  const { data } = await apiClient.get<Subject>(`/subjects/${id}`)
  return data
}

export async function createSubject(input: SubjectInput): Promise<Subject> {
  const { data } = await apiClient.post<Subject>('/subjects', input)
  return data
}

export async function updateSubject(id: number, input: SubjectInput): Promise<Subject> {
  const { data } = await apiClient.patch<Subject>(`/subjects/${id}`, input)
  return data
}

export async function deleteSubject(id: number): Promise<void> {
  await apiClient.delete(`/subjects/${id}`)
}
