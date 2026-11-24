import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listProfessors } from '../../features/professors/api'
import { createSection, getSection, updateSection } from '../../features/sections/api'
import { listSubjects } from '../../features/subjects/api'
import { httpError } from '../../test/http-error'
import { renderRoutes } from '../../test/render'
import { SectionFormPage } from './SectionFormPage'

vi.mock('../../features/sections/api', () => ({
  createSection: vi.fn(),
  updateSection: vi.fn(),
  getSection: vi.fn(),
  SECTIONS_PAGE_SIZE: 10,
}))
vi.mock('../../features/subjects/api', () => ({ listSubjects: vi.fn(), SUBJECTS_PAGE_SIZE: 10 }))
vi.mock('../../features/professors/api', () => ({
  listProfessors: vi.fn(),
  PROFESSORS_PAGE_SIZE: 10,
}))

const createMock = vi.mocked(createSection)
const updateMock = vi.mocked(updateSection)

const routes = [
  { path: '/secretaria/turmas', element: <p>Lista de turmas</p> },
  { path: '/secretaria/turmas/nova', element: <SectionFormPage /> },
  { path: '/secretaria/turmas/:id/editar', element: <SectionFormPage /> },
]

const section = {
  id: 7,
  code: 'A',
  subject: { id: 1, code: 'IF669', name: 'Introdução à Programação' },
  professor: { id: 2, name: 'Paulo Borba' },
  capacity: 40,
  occupiedSeats: 12,
}

describe('SectionFormPage', () => {
  beforeEach(() => {
    createMock.mockReset()
    updateMock.mockReset()
    vi.mocked(listSubjects).mockResolvedValue({
      items: [
        {
          id: 1,
          code: 'IF669',
          name: 'Introdução à Programação',
          workloadHours: 60,
          prerequisites: [],
        },
      ],
      total: 1,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })
    vi.mocked(listProfessors).mockResolvedValue({
      items: [{ id: 2, name: 'Paulo Borba', email: 'paulo@cin.ufpe.br' }],
      total: 1,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })
    vi.mocked(getSection).mockResolvedValue(section)
  })

  it('opens a section with the selected subject and professor', async () => {
    createMock.mockResolvedValue({ ...section, code: 'B', occupiedSeats: 0 })
    renderRoutes(routes, '/secretaria/turmas/nova')

    await userEvent.selectOptions(
      await screen.findByLabelText('Disciplina'),
      'IF669 - Introdução à Programação',
    )
    await userEvent.selectOptions(screen.getByLabelText('Professor'), 'Paulo Borba')
    await userEvent.type(screen.getByLabelText('Código da turma'), 'b')
    await userEvent.type(screen.getByLabelText('Vagas'), '30')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Lista de turmas')).toBeInTheDocument()
    expect(createMock).toHaveBeenCalledWith({
      subjectId: 1,
      professorId: 2,
      code: 'B',
      capacity: 30,
    })
  })

  it('prevents reducing the seats below the enrolled students', async () => {
    renderRoutes(routes, '/secretaria/turmas/7/editar')

    const capacity = await screen.findByLabelText('Vagas')
    await userEvent.clear(capacity)
    await userEvent.type(capacity, '10')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(screen.getByText(/A turma tem 12 alunos matriculados/)).toBeInTheDocument()
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('locks the subject of a section with enrolled students', async () => {
    renderRoutes(routes, '/secretaria/turmas/7/editar')

    expect(await screen.findByLabelText('Disciplina')).toBeDisabled()
  })

  it('shows the API refusal next to the related field', async () => {
    updateMock.mockRejectedValue(
      httpError(409, 'SECTION_CODE_TAKEN', 'Já existe uma turma B para esta disciplina.'),
    )
    renderRoutes(routes, '/secretaria/turmas/7/editar')

    const code = await screen.findByLabelText('Código da turma')
    await userEvent.clear(code)
    await userEvent.type(code, 'B')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByText('Já existe uma turma B para esta disciplina.'),
    ).toBeInTheDocument()
    expect(code).toHaveAttribute('aria-invalid', 'true')
  })
})
