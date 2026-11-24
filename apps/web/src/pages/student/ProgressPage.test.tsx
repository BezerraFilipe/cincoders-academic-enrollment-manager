import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getMyProgress } from '../../features/progress/api'
import { renderRoutes } from '../../test/render'
import { ProgressPage } from './ProgressPage'

vi.mock('../../features/progress/api', () => ({ getMyProgress: vi.fn() }))

const getMyProgressMock = vi.mocked(getMyProgress)

const progress = {
  course: { code: 'CC', name: 'Ciência da Computação' },
  groups: [
    {
      group: 'MANDATORY' as const,
      requiredHours: 300,
      completedHours: 180,
      inProgressHours: 60,
      remainingHours: 120,
      completionPercentage: 60,
    },
    {
      group: 'PROFILE_ELECTIVE' as const,
      requiredHours: 120,
      completedHours: 120,
      inProgressHours: 0,
      remainingHours: 0,
      completionPercentage: 100,
    },
    {
      group: 'FREE_ELECTIVE' as const,
      requiredHours: 60,
      completedHours: 90,
      inProgressHours: 0,
      remainingHours: 0,
      completionPercentage: 100,
    },
  ],
}

function renderPage() {
  return renderRoutes([{ path: '/aluno/progresso', element: <ProgressPage /> }], '/aluno/progresso')
}

describe('ProgressPage', () => {
  beforeEach(() => {
    getMyProgressMock.mockReset()
  })

  it('shows required, completed, in progress and remaining hours for each group', async () => {
    getMyProgressMock.mockResolvedValue(progress)

    renderPage()

    const mandatory = (await screen.findByText('Obrigatórias')).closest('article')!
    expect(within(mandatory).getByText('300h')).toBeInTheDocument()
    expect(within(mandatory).getByText('180h')).toBeInTheDocument()
    expect(within(mandatory).getByText('60h')).toBeInTheDocument()
    expect(within(mandatory).getByText('120h')).toBeInTheDocument()
    expect(screen.getByText('Ciência da Computação')).toBeInTheDocument()
  })

  it('exposes the completion of each group as an accessible progress bar', async () => {
    getMyProgressMock.mockResolvedValue(progress)

    renderPage()

    expect(
      await screen.findByRole('progressbar', { name: 'Progresso em Obrigatórias' }),
    ).toHaveAttribute('aria-valuenow', '60')
    expect(
      screen.getByRole('progressbar', { name: 'Progresso em Eletivas livres' }),
    ).toHaveAttribute('aria-valuenow', '100')
  })

  it('offers a retry when the progress cannot be loaded', async () => {
    getMyProgressMock.mockRejectedValueOnce(new AxiosError('Network Error'))
    getMyProgressMock.mockResolvedValueOnce(progress)
    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByText('Obrigatórias')).toBeInTheDocument()
  })
})
