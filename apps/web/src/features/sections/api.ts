import { apiClient } from '../../lib/api-client'
import type { Page } from '../../lib/page'
import type { Section, SectionInput } from './types'

export const SECTIONS_PAGE_SIZE = 10

export async function listSections(params: {
  search: string
  page: number
}): Promise<Page<Section>> {
  const { data } = await apiClient.get<Page<Section>>('/sections', {
    params: { search: params.search || undefined, page: params.page, pageSize: SECTIONS_PAGE_SIZE },
  })
  return data
}

export async function getSection(id: number): Promise<Section> {
  const { data } = await apiClient.get<Section>(`/sections/${id}`)
  return data
}

export async function createSection(input: SectionInput): Promise<Section> {
  const { data } = await apiClient.post<Section>('/sections', input)
  return data
}

export async function updateSection(id: number, input: SectionInput): Promise<Section> {
  const { data } = await apiClient.patch<Section>(`/sections/${id}`, input)
  return data
}

export async function deleteSection(id: number): Promise<void> {
  await apiClient.delete(`/sections/${id}`)
}
