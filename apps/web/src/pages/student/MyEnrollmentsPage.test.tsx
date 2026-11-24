import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cancelEnrollment, listMyEnrollments } from '../../features/enrollments/api'
import type { Enrollment } from '../../features/enrollments/types'
import { renderRoutes } from '../../test/render'
import { MyEnrollmentsPage } from './MyEnrollmentsPage'

vi.mock('../../features/enrollments/api', () => ({
  listMyEnrollments: vi.fn(),
  cancelEnrollment: vi.fn(),
  enroll: vi.fn(),
}))

const listMock = vi.mocked(listMyEnrollments)
const cancelMock = vi.mocked(cancelEnrollment)

const enrollment: Enrollment = {
  id: 10,
  sectionId: 1,
  sectionCode: 'A',
  subject: { code: 'IF673', name: 'Engenharia de Software', workloadHours: 60 },
  professorName: 'Fernanda Rocha',
  createdAt: new Date().toISOString(),
}

function renderPage() {
  return renderRoutes(
    [{ path: '/aluno/matriculas', element: <MyEnrollmentsPage /> }],
    '/aluno/matriculas',
  )
}

describe('MyEnrollmentsPage', () => {
  beforeEach(() => {
    listMock.mockReset()
    cancelMock.mockReset()
  })

  it('lists the active enrollments with the total workload in progress', async () => {
    listMock.mockResolvedValue([enrollment])

    renderPage()

    expect(await screen.findByText('Engenharia de Software')).toBeInTheDocument()
    expect(screen.getByText(/60h em curso/)).toBeInTheDocument()
  })

  it('shows an empty state with a link to the offerings', async () => {
    listMock.mockResolvedValue([])

    renderPage()

    expect(
      await screen.findByText('Você não tem matrículas ativas neste semestre.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver ofertas do semestre' })).toBeInTheDocument()
  })

  it('asks for confirmation before cancelling and refreshes the list', async () => {
    listMock.mockResolvedValueOnce([enrollment])
    listMock.mockResolvedValue([])
    cancelMock.mockResolvedValue()
    renderPage()

    await userEvent.click(
      await screen.findByRole('button', { name: 'Cancelar matrícula em IF673 turma A' }),
    )
    expect(cancelMock).not.toHaveBeenCalled()

    await userEvent.click(
      screen.getByRole('button', { name: 'Confirmar cancelamento de IF673 turma A' }),
    )

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Matrícula em IF673 cancelada. A vaga foi liberada.',
    )
    expect(cancelMock).toHaveBeenCalledWith(10, expect.anything())
    expect(
      await screen.findByText('Você não tem matrículas ativas neste semestre.'),
    ).toBeInTheDocument()
  })

  it('shows the API message when the cancellation is refused', async () => {
    listMock.mockResolvedValue([enrollment])
    cancelMock.mockRejectedValue(
      new AxiosError('Unprocessable', '422', undefined, undefined, {
        status: 422,
        statusText: '',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {
          statusCode: 422,
          code: 'ENROLLMENT_NOT_ACTIVE',
          message: 'Esta matrícula já foi cancelada.',
        },
      }),
    )
    renderPage()

    await userEvent.click(
      await screen.findByRole('button', { name: 'Cancelar matrícula em IF673 turma A' }),
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Confirmar cancelamento de IF673 turma A' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('Esta matrícula já foi cancelada.')
  })
})
