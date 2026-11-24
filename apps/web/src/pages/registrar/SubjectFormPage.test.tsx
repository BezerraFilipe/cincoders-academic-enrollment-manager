import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSubject, getSubject, updateSubject } from '../../features/subjects/api'
import { httpError } from '../../test/http-error'
import { renderRoutes } from '../../test/render'
import { SubjectFormPage } from './SubjectFormPage'

vi.mock('../../features/subjects/api', () => ({
  createSubject: vi.fn(),
  updateSubject: vi.fn(),
  getSubject: vi.fn(),
  SUBJECTS_PAGE_SIZE: 10,
}))

const createMock = vi.mocked(createSubject)
const updateMock = vi.mocked(updateSubject)
const getMock = vi.mocked(getSubject)

const routes = [
  { path: '/secretaria/disciplinas', element: <p>Lista de disciplinas</p> },
  { path: '/secretaria/disciplinas/nova', element: <SubjectFormPage /> },
  { path: '/secretaria/disciplinas/:id/editar', element: <SubjectFormPage /> },
]

async function fill(code: string, name: string, workloadHours: string) {
  await userEvent.type(screen.getByLabelText('Código'), code)
  await userEvent.type(screen.getByLabelText('Nome'), name)
  await userEvent.type(screen.getByLabelText('Carga horária (h)'), workloadHours)
  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
}

describe('SubjectFormPage', () => {
  beforeEach(() => {
    createMock.mockReset()
    updateMock.mockReset()
    getMock.mockReset()
  })

  it('validates the workload before calling the API', async () => {
    renderRoutes(routes, '/secretaria/disciplinas/nova')

    await fill('IF700', 'Nova disciplina', '20')

    expect(
      screen.getByText('A carga horária deve ser múltipla de 15, entre 15h e 120h.'),
    ).toBeInTheDocument()
    expect(createMock).not.toHaveBeenCalled()
  })

  it('creates a subject with a normalized code and returns to the list', async () => {
    createMock.mockResolvedValue({
      id: 9,
      code: 'IF700',
      name: 'Nova disciplina',
      workloadHours: 45,
    })
    renderRoutes(routes, '/secretaria/disciplinas/nova')

    await fill('if700', 'Nova disciplina', '45')

    expect(await screen.findByText('Lista de disciplinas')).toBeInTheDocument()
    expect(createMock).toHaveBeenCalledWith({
      code: 'IF700',
      name: 'Nova disciplina',
      workloadHours: 45,
    })
  })

  it('shows a duplicated code next to the code field', async () => {
    createMock.mockRejectedValue(
      httpError(409, 'SUBJECT_CODE_TAKEN', 'Já existe uma disciplina com o código IF669.'),
    )
    renderRoutes(routes, '/secretaria/disciplinas/nova')

    await fill('IF669', 'Duplicada', '60')

    expect(
      await screen.findByText('Já existe uma disciplina com o código IF669.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Código')).toHaveAttribute('aria-invalid', 'true')
  })

  it('loads the subject being edited', async () => {
    getMock.mockResolvedValue({ id: 3, code: 'IF671', name: 'Algoritmos', workloadHours: 60 })
    updateMock.mockResolvedValue({ id: 3, code: 'IF671', name: 'Algoritmos II', workloadHours: 60 })
    renderRoutes(routes, '/secretaria/disciplinas/3/editar')

    expect(await screen.findByLabelText('Nome')).toHaveValue('Algoritmos')

    await userEvent.type(screen.getByLabelText('Nome'), ' II')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Lista de disciplinas')).toBeInTheDocument()
    expect(updateMock).toHaveBeenCalledWith(3, {
      code: 'IF671',
      name: 'Algoritmos II',
      workloadHours: 60,
    })
  })
})
