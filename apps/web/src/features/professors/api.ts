import { apiClient } from '../../lib/api-client'
import type { Page } from '../../lib/page'
import type { Professor, ProfessorInput } from './types'

export const PROFESSORS_PAGE_SIZE = 10

export async function listProfessors(params: {
  search: string
  page: number
  pageSize?: number
}): Promise<Page<Professor>> {
  const { data } = await apiClient.get<Page<Professor>>('/professors', {
    params: {
      search: params.search || undefined,
      page: params.page,
      pageSize: params.pageSize ?? PROFESSORS_PAGE_SIZE,
    },
  })
  return data
}

export async function getProfessor(id: number): Promise<Professor> {
  const { data } = await apiClient.get<Professor>(`/professors/${id}`)
  return data
}

export async function createProfessor(input: ProfessorInput): Promise<Professor> {
  const { data } = await apiClient.post<Professor>('/professors', input)
  return data
}

export async function updateProfessor(id: number, input: ProfessorInput): Promise<Professor> {
  const { data } = await apiClient.patch<Professor>(`/professors/${id}`, input)
  return data
}

export async function deleteProfessor(id: number): Promise<void> {
  await apiClient.delete(`/professors/${id}`)
}
