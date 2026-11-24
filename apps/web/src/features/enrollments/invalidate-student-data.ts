import type { QueryClient } from '@tanstack/react-query'

export function invalidateStudentData(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['offerings'] }),
    queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
    queryClient.invalidateQueries({ queryKey: ['progress'] }),
  ])
}
