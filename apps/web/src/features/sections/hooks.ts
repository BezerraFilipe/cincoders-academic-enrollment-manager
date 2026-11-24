import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listProfessors } from '../professors/api'
import { listSubjects } from '../subjects/api'
import { createSection, deleteSection, getSection, listSections, updateSection } from './api'
import type { SectionInput } from './types'

const SELECT_OPTIONS_LIMIT = 50

export function useSections(params: { search: string; page: number }) {
  return useQuery({
    queryKey: ['sections', params],
    queryFn: () => listSections(params),
    placeholderData: keepPreviousData,
  })
}

export function useSection(id: number | undefined) {
  return useQuery({
    queryKey: ['sections', 'detail', id],
    queryFn: () => getSection(id!),
    enabled: id !== undefined,
  })
}

export function useSectionFormOptions() {
  const subjects = useQuery({
    queryKey: ['subjects', 'options'],
    queryFn: () => listSubjects({ search: '', page: 1, pageSize: SELECT_OPTIONS_LIMIT }),
  })
  const professors = useQuery({
    queryKey: ['professors', 'options'],
    queryFn: () => listProfessors({ search: '', page: 1, pageSize: SELECT_OPTIONS_LIMIT }),
  })
  return { subjects, professors }
}

export function useSaveSection(id: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SectionInput) =>
      id === undefined ? createSection(input) : updateSection(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sections'] }),
  })
}

export function useDeleteSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sections'] }),
  })
}
