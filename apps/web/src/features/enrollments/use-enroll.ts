import { useMutation, useQueryClient } from '@tanstack/react-query'
import { enroll } from './api'
import { invalidateStudentData } from './invalidate-student-data'

export function useEnroll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: enroll,
    onSettled: () => invalidateStudentData(queryClient),
  })
}
