import { apiClient } from '../../lib/api-client'
import type { Page } from '../../lib/page'
import type { Offering } from './types'

export interface ListParams {
  search: string
  page: number
}

export const OFFERINGS_PAGE_SIZE = 10

export async function listOfferings({ search, page }: ListParams): Promise<Page<Offering>> {
  const { data } = await apiClient.get<Page<Offering>>('/me/offerings', {
    params: { search: search || undefined, page, pageSize: OFFERINGS_PAGE_SIZE },
  })
  return data
}
