import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteSubject, listSubjects } from '../../features/subjects/api'
import { httpError } from '../../test/http-error'
import { renderRoutes } from '../../test/render'
import { SubjectsPage } from './SubjectsPage'

vi.mock('../../features/subjects/api', () => ({
  listSubjects: vi.fn(),
  deleteSubject: vi.fn(),
  SUBJECTS_PAGE_SIZE: 10,
}))

const listMock = vi.mocked(listSubjects)
const deleteMock = vi.mocked(deleteSubject)

const page = {
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
  pageSize: 10,
  totalPages: 1,
}

function renderPage() {
  return renderRoutes(
    [{ path: '/secretaria/disciplinas', element: <SubjectsPage /> }],
    '/secretaria/disciplinas',
  )
}

describe('SubjectsPage', () => {
  beforeEach(() => {
    listMock.mockReset()
    deleteMock.mockReset()
  })

  it('lists the subjects', async () => {
    listMock.mockResolvedValue(page)

    renderPage()

    expect(await screen.findByText('Introdução à Programação')).toBeInTheDocument()
    expect(screen.getByText('60h')).toBeInTheDocument()
  })

  it('explains why a subject in use cannot be deleted', async () => {
    listMock.mockResolvedValue(page)
    deleteMock.mockRejectedValue(
      httpError(409, 'RESOURCE_IN_USE', 'Não é possível excluir a disciplina: ela possui turmas.'),
    )
    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir IF669' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão de IF669' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('ela possui turmas')
  })

  it('deletes a subject after confirmation', async () => {
    listMock.mockResolvedValue(page)
    deleteMock.mockResolvedValue()
    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir IF669' }))
    expect(deleteMock).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão de IF669' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Disciplina IF669 excluída.')
  })
})
