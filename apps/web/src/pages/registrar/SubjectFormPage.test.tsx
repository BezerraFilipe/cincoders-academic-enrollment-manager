import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSubject, getSubject, listSubjects, updateSubject } from '../../features/subjects/api'
import type { Subject } from '../../features/subjects/types'
import { httpError } from '../../test/http-error'
import { renderRoutes } from '../../test/render'
import { SubjectFormPage } from './SubjectFormPage'

vi.mock('../../features/subjects/api', () => ({
  createSubject: vi.fn(),
  updateSubject: vi.fn(),
  getSubject: vi.fn(),
  listSubjects: vi.fn(),
  SUBJECTS_PAGE_SIZE: 10,
}))

const createMock = vi.mocked(createSubject)
const updateMock = vi.mocked(updateSubject)
const getMock = vi.mocked(getSubject)

const introduction: Subject = {
  id: 1,
  code: 'IF669',
  name: 'Introdução à Programação',
  workloadHours: 60,
  prerequisites: [],
}
const algorithms: Subject = {
  id: 3,
  code: 'IF671',
  name: 'Algoritmos',
  workloadHours: 60,
  prerequisites: [{ id: 1, code: 'IF669', name: 'Introdução à Programação' }],
}

const routes = [
  { path: '/secretaria/disciplinas', element: <p>Lista de disciplinas</p> },
  { path: '/secretaria/disciplinas/nova', element: <SubjectFormPage /> },
  { path: '/secretaria/disciplinas/:id/editar', element: <SubjectFormPage /> },
]

async function fill(code: string, name: string, workloadHours: string) {
  await userEvent.type(await screen.findByLabelText('Código'), code)
  await userEvent.type(screen.getByLabelText('Nome'), name)
  await userEvent.type(screen.getByLabelText('Carga horária (h)'), workloadHours)
}

describe('SubjectFormPage', () => {
  beforeEach(() => {
    createMock.mockReset()
    updateMock.mockReset()
    getMock.mockReset()
    vi.mocked(listSubjects).mockResolvedValue({
      items: [introduction, algorithms],
      total: 2,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })
  })

  it('validates the workload before calling the API', async () => {
    renderRoutes(routes, '/secretaria/disciplinas/nova')

    await fill('IF700', 'Nova disciplina', '20')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      screen.getByText('A carga horária deve ser múltipla de 15, entre 15h e 120h.'),
    ).toBeInTheDocument()
    expect(createMock).not.toHaveBeenCalled()
  })

  it('creates a subject with a normalized code and the selected prerequisites', async () => {
    createMock.mockResolvedValue({ ...introduction, id: 9, code: 'IF700' })
    renderRoutes(routes, '/secretaria/disciplinas/nova')

    await fill('if700', 'Nova disciplina', '45')
    await userEvent.click(screen.getByRole('checkbox', { name: 'IF671 - Algoritmos' }))
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Lista de disciplinas')).toBeInTheDocument()
    expect(createMock).toHaveBeenCalledWith({
      code: 'IF700',
      name: 'Nova disciplina',
      workloadHours: 45,
      prerequisiteIds: [3],
    })
  })

  it('shows a duplicated code next to the code field', async () => {
    createMock.mockRejectedValue(
      httpError(409, 'SUBJECT_CODE_TAKEN', 'Já existe uma disciplina com o código IF669.'),
    )
    renderRoutes(routes, '/secretaria/disciplinas/nova')

    await fill('IF669', 'Duplicada', '60')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByText('Já existe uma disciplina com o código IF669.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Código')).toHaveAttribute('aria-invalid', 'true')
  })

  it('loads the subject being edited, without offering itself as prerequisite', async () => {
    getMock.mockResolvedValue(algorithms)
    updateMock.mockResolvedValue({ ...algorithms, name: 'Algoritmos II' })
    renderRoutes(routes, '/secretaria/disciplinas/3/editar')

    expect(await screen.findByLabelText('Nome')).toHaveValue('Algoritmos')
    expect(screen.getByRole('checkbox', { name: 'IF669 - Introdução à Programação' })).toBeChecked()
    expect(screen.queryByRole('checkbox', { name: 'IF671 - Algoritmos' })).not.toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Nome'), ' II')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Lista de disciplinas')).toBeInTheDocument()
    expect(updateMock).toHaveBeenCalledWith(3, {
      code: 'IF671',
      name: 'Algoritmos II',
      workloadHours: 60,
      prerequisiteIds: [1],
    })
  })

  it('shows a prerequisite cycle refused by the API', async () => {
    getMock.mockResolvedValue(introduction)
    updateMock.mockRejectedValue(
      httpError(422, 'PREREQUISITE_CYCLE', 'Esses pré-requisitos criariam um ciclo.'),
    )
    renderRoutes(routes, '/secretaria/disciplinas/1/editar')

    await userEvent.click(await screen.findByRole('checkbox', { name: 'IF671 - Algoritmos' }))
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Esses pré-requisitos criariam um ciclo.')).toBeInTheDocument()
  })
})
