import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { writeSession } from '../../features/auth/session-storage'
import type { UserRole } from '../../features/auth/types'
import { renderRoutes } from '../../test/render'
import { ProtectedRoute } from './ProtectedRoute'

const routes = [
  { path: '/login', element: <p>Tela de login</p> },
  {
    path: '/secretaria',
    element: (
      <ProtectedRoute role="REGISTRAR">
        <p>Área da secretaria</p>
      </ProtectedRoute>
    ),
  },
  {
    path: '/aluno',
    element: (
      <ProtectedRoute role="STUDENT">
        <p>Área do aluno</p>
      </ProtectedRoute>
    ),
  },
]

function signInAs(role: UserRole) {
  writeSession({
    accessToken: 'token',
    user: { id: 1, name: 'Usuário', email: 'usuario@cin.ufpe.br', role },
  })
}

describe('ProtectedRoute', () => {
  it('redirects an unauthenticated user to the login page', () => {
    renderRoutes(routes, '/secretaria')

    expect(screen.getByText('Tela de login')).toBeInTheDocument()
  })

  it('renders the area for a user with the required role', () => {
    signInAs('REGISTRAR')
    renderRoutes(routes, '/secretaria')

    expect(screen.getByText('Área da secretaria')).toBeInTheDocument()
  })

  it('redirects a student who tries to open the registrar area to the student area', () => {
    signInAs('STUDENT')
    renderRoutes(routes, '/secretaria')

    expect(screen.getByText('Área do aluno')).toBeInTheDocument()
  })
})
