import { useQuery } from '@tanstack/react-query'
import { listMyEnrollments } from './api'

export function useMyEnrollments() {
  return useQuery({ queryKey: ['enrollments'], queryFn: listMyEnrollments })
}
