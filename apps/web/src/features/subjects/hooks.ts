import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSubject, deleteSubject, getSubject, listSubjects, updateSubject } from './api'
import type { SubjectInput } from './types'

export function useSubjects(params: { search: string; page: number }) {
  return useQuery({
    queryKey: ['subjects', params],
    queryFn: () => listSubjects(params),
    placeholderData: keepPreviousData,
  })
}

export function useSubject(id: number | undefined) {
  return useQuery({
    queryKey: ['subjects', 'detail', id],
    queryFn: () => getSubject(id!),
    enabled: id !== undefined,
  })
}

export function useSubjectOptions() {
  return useQuery({
    queryKey: ['subjects', 'options'],
    queryFn: () => listSubjects({ search: '', page: 1, pageSize: 50 }),
  })
}

export function useSaveSubject(id: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SubjectInput) =>
      id === undefined ? createSubject(input) : updateSubject(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  })
}

export function useDeleteSubject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  })
}
