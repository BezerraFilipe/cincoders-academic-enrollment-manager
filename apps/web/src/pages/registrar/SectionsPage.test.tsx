import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { listSections } from '../../features/sections/api'
import { renderRoutes } from '../../test/render'
import { SectionsPage } from './SectionsPage'

vi.mock('../../features/sections/api', () => ({
  listSections: vi.fn(),
  deleteSection: vi.fn(),
  SECTIONS_PAGE_SIZE: 10,
}))

describe('SectionsPage', () => {
  it('lists the sections with occupied and total seats', async () => {
    vi.mocked(listSections).mockResolvedValue({
      items: [
        {
          id: 1,
          code: 'A',
          subject: { id: 1, code: 'IF669', name: 'Introdução à Programação' },
          professor: { id: 1, name: 'Paulo Borba' },
          capacity: 40,
          occupiedSeats: 12,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    })

    renderRoutes([{ path: '/secretaria/turmas', element: <SectionsPage /> }], '/secretaria/turmas')

    expect(await screen.findByText('12 / 40')).toBeInTheDocument()
    expect(screen.getByText('Paulo Borba')).toBeInTheDocument()
  })
})
