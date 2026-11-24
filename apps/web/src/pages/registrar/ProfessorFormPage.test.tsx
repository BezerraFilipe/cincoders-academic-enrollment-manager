import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProfessor } from '../../features/professors/api'
import { httpError } from '../../test/http-error'
import { renderRoutes } from '../../test/render'
import { ProfessorFormPage } from './ProfessorFormPage'

vi.mock('../../features/professors/api', () => ({
  createProfessor: vi.fn(),
  updateProfessor: vi.fn(),
  getProfessor: vi.fn(),
  PROFESSORS_PAGE_SIZE: 10,
}))

const createMock = vi.mocked(createProfessor)

const routes = [
  { path: '/secretaria/professores', element: <p>Lista de professores</p> },
  { path: '/secretaria/professores/novo', element: <ProfessorFormPage /> },
]

async function fill(name: string, email: string) {
  await userEvent.type(screen.getByLabelText('Nome'), name)
  await userEvent.type(screen.getByLabelText('E-mail'), email)
  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
}

describe('ProfessorFormPage', () => {
  beforeEach(() => {
    createMock.mockReset()
  })

  it('validates the e-mail before calling the API', async () => {
    renderRoutes(routes, '/secretaria/professores/novo')

    await fill('Paulo Borba', 'paulo@')

    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument()
    expect(createMock).not.toHaveBeenCalled()
  })

  it('creates a professor with a normalized e-mail and returns to the list', async () => {
    createMock.mockResolvedValue({ id: 5, name: 'Paulo Borba', email: 'paulo@cin.ufpe.br' })
    renderRoutes(routes, '/secretaria/professores/novo')

    await fill('Paulo Borba', 'Paulo@CIN.ufpe.br')

    expect(await screen.findByText('Lista de professores')).toBeInTheDocument()
    expect(createMock).toHaveBeenCalledWith({ name: 'Paulo Borba', email: 'paulo@cin.ufpe.br' })
  })

  it('shows a duplicated e-mail next to the e-mail field', async () => {
    createMock.mockRejectedValue(
      httpError(
        409,
        'PROFESSOR_EMAIL_TAKEN',
        'Já existe um professor com o e-mail paulo@cin.ufpe.br.',
      ),
    )
    renderRoutes(routes, '/secretaria/professores/novo')

    await fill('Paulo Borba', 'paulo@cin.ufpe.br')

    expect(
      await screen.findByText('Já existe um professor com o e-mail paulo@cin.ufpe.br.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true')
  })
})
