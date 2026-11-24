import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { getCurrentUser } from '../features/auth/api'
import { writeSession } from '../features/auth/session-storage'
import { renderRoutes } from '../test/render'
import { StudentLayout } from './StudentLayout'

vi.mock('../features/auth/api', () => ({ getCurrentUser: vi.fn(), login: vi.fn() }))

describe('StudentLayout', () => {
  it('shows the student name, e-mail, registration number and course in the header', async () => {
    const user = {
      id: 1,
      name: 'Ana Souza',
      email: 'ana.souza@cin.ufpe.br',
      role: 'STUDENT' as const,
    }
    writeSession({ accessToken: 'token', user })
    vi.mocked(getCurrentUser).mockResolvedValue({
      ...user,
      student: {
        registrationNumber: '20230001',
        course: { code: 'CC', name: 'Ciência da Computação' },
      },
    })

    renderRoutes([{ path: '/aluno', element: <StudentLayout /> }], '/aluno')

    expect(screen.getByText('Ana Souza')).toBeInTheDocument()
    expect(screen.getByText('ana.souza@cin.ufpe.br')).toBeInTheDocument()
    expect(await screen.findByText('20230001')).toBeInTheDocument()
    expect(screen.getByText('Ciência da Computação')).toBeInTheDocument()
  })
})
