import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listOfferings, type ListParams } from './api'

export function useOfferings(params: ListParams) {
  return useQuery({
    queryKey: ['offerings', params],
    queryFn: () => listOfferings(params),
    placeholderData: keepPreviousData,
  })
}
