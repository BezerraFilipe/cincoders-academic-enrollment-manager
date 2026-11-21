import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getHealth } from '../features/health/api'
import { renderWithProviders } from '../test/render'
import { HomePage } from './HomePage'

vi.mock('../features/health/api', () => ({
  getHealth: vi.fn(),
}))

const getHealthMock = vi.mocked(getHealth)

describe('HomePage', () => {
  beforeEach(() => {
    getHealthMock.mockReset()
  })

  it('shows API and database as online when the server responds', async () => {
    getHealthMock.mockResolvedValue({ status: 'ok', database: 'up' })

    renderWithProviders(<HomePage />)

    expect(screen.getByRole('status')).toHaveTextContent('Verificando o servidor...')
    expect(await screen.findAllByText('Online')).toHaveLength(2)
  })

  it('shows an error with a retry action when the server is unreachable', async () => {
    getHealthMock.mockRejectedValueOnce(new Error('Network Error'))
    getHealthMock.mockResolvedValueOnce({ status: 'ok', database: 'up' })

    renderWithProviders(<HomePage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível se comunicar com o servidor.',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findAllByText('Online')).toHaveLength(2)
    expect(getHealthMock).toHaveBeenCalledTimes(2)
  })
})
