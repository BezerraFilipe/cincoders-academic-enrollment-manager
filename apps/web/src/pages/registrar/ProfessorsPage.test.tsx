import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteProfessor, listProfessors } from '../../features/professors/api'
import { httpError } from '../../test/http-error'
import { renderRoutes } from '../../test/render'
import { ProfessorsPage } from './ProfessorsPage'

vi.mock('../../features/professors/api', () => ({
  listProfessors: vi.fn(),
  deleteProfessor: vi.fn(),
  PROFESSORS_PAGE_SIZE: 10,
}))

const listMock = vi.mocked(listProfessors)
const deleteMock = vi.mocked(deleteProfessor)

function renderPage() {
  return renderRoutes(
    [{ path: '/secretaria/professores', element: <ProfessorsPage /> }],
    '/secretaria/professores',
  )
}

describe('ProfessorsPage', () => {
  beforeEach(() => {
    listMock.mockReset()
    deleteMock.mockReset()
    listMock.mockResolvedValue({
      items: [{ id: 1, name: 'Paulo Borba', email: 'paulo@cin.ufpe.br' }],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    })
  })

  it('lists the professors', async () => {
    renderPage()

    expect(await screen.findByText('Paulo Borba')).toBeInTheDocument()
    expect(screen.getByText('paulo@cin.ufpe.br')).toBeInTheDocument()
  })

  it('explains why a professor with sections cannot be deleted', async () => {
    deleteMock.mockRejectedValue(
      httpError(
        409,
        'RESOURCE_IN_USE',
        'Não é possível excluir o professor: ele é responsável por 2 turmas.',
      ),
    )
    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir Paulo Borba' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão de Paulo Borba' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('responsável por 2 turmas')
  })
})
