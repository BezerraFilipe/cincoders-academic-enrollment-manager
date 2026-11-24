import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelEnrollment } from './api'
import { invalidateStudentData } from './invalidate-student-data'

export function useCancelEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelEnrollment,
    onSettled: () => invalidateStudentData(queryClient),
  })
}
