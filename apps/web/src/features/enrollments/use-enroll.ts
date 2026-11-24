import { useMutation, useQueryClient } from '@tanstack/react-query'
import { enroll } from './api'

export function useEnroll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: enroll,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['offerings'] }),
        queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
      ]),
  })
}
