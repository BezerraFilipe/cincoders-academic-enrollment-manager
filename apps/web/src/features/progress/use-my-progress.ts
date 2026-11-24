import { useQuery } from '@tanstack/react-query'
import { getMyProgress } from './api'

export function useMyProgress() {
  return useQuery({ queryKey: ['progress'], queryFn: getMyProgress })
}
