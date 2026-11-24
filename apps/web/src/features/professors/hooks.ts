import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProfessor,
  deleteProfessor,
  getProfessor,
  listProfessors,
  updateProfessor,
} from './api'
import type { ProfessorInput } from './types'

export function useProfessors(params: { search: string; page: number }) {
  return useQuery({
    queryKey: ['professors', params],
    queryFn: () => listProfessors(params),
    placeholderData: keepPreviousData,
  })
}

export function useProfessor(id: number | undefined) {
  return useQuery({
    queryKey: ['professors', 'detail', id],
    queryFn: () => getProfessor(id!),
    enabled: id !== undefined,
  })
}

export function useSaveProfessor(id: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ProfessorInput) =>
      id === undefined ? createProfessor(input) : updateProfessor(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['professors'] }),
  })
}

export function useDeleteProfessor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProfessor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['professors'] }),
  })
}
