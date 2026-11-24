import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { login } from '../features/auth/api'
import { readSession } from '../features/auth/session-storage'
import { renderRoutes } from '../test/render'
import { LoginPage } from './LoginPage'

vi.mock('../features/auth/api', () => ({ login: vi.fn() }))

const loginMock = vi.mocked(login)

const routes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/aluno', element: <p>Área do aluno</p> },
  { path: '/secretaria', element: <p>Área da secretaria</p> },
]

async function submit(email: string, password: string) {
  await userEvent.type(screen.getByLabelText('E-mail'), email)
  await userEvent.type(screen.getByLabelText('Senha'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset()
  })

  it('stores the session and redirects a student to the student area', async () => {
    loginMock.mockResolvedValue({
      accessToken: 'token',
      user: { id: 1, name: 'Ana', email: 'ana@cin.ufpe.br', role: 'STUDENT' },
    })
    renderRoutes(routes, '/login')

    await submit('ana@cin.ufpe.br', 'Senha@123')

    expect(await screen.findByText('Área do aluno')).toBeInTheDocument()
    expect(readSession()?.accessToken).toBe('token')
  })

  it('shows the message returned by the API when credentials are invalid', async () => {
    loginMock.mockRejectedValue(
      new AxiosError('Unauthorized', '401', undefined, undefined, {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {
          statusCode: 401,
          code: 'INVALID_CREDENTIALS',
          message: 'E-mail ou senha inválidos.',
        },
      }),
    )
    renderRoutes(routes, '/login')

    await submit('ana@cin.ufpe.br', 'errada')

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.')
    expect(readSession()).toBeNull()
  })

  it('warns the user when the previous session expired', () => {
    renderRoutes(routes, '/login?sessao=expirada')

    expect(screen.getByRole('status')).toHaveTextContent('Sua sessão expirou.')
  })
})
