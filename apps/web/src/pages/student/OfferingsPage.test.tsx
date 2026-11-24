import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useLocation } from 'react-router'
import { listOfferings } from '../../features/offerings/api'
import type { Offering } from '../../features/offerings/types'
import { renderRoutes } from '../../test/render'
import { OfferingsPage } from './OfferingsPage'

vi.mock('../../features/offerings/api', () => ({
  listOfferings: vi.fn(),
  OFFERINGS_PAGE_SIZE: 10,
}))

const listOfferingsMock = vi.mocked(listOfferings)

function LocationProbe() {
  return <p data-testid="location">{useLocation().search}</p>
}

function renderPage(path = '/aluno/ofertas') {
  return renderRoutes(
    [
      {
        path: '/aluno/ofertas',
        element: (
          <>
            <OfferingsPage />
            <LocationProbe />
          </>
        ),
      },
    ],
    path,
  )
}

function offering(overrides: Partial<Offering>): Offering {
  return {
    sectionId: 1,
    sectionCode: 'A',
    subject: { id: 1, code: 'IF669', name: 'Introdução à Programação', workloadHours: 60 },
    professorName: 'Paulo Borba',
    capacity: 40,
    occupiedSeats: 38,
    availableSeats: 2,
    category: 'MANDATORY',
    enrolled: false,
    alreadyPassed: false,
    ...overrides,
  }
}

function page(items: Offering[]) {
  return { items, total: items.length, page: 1, pageSize: 10, totalPages: 1 }
}

describe('OfferingsPage', () => {
  beforeEach(() => {
    listOfferingsMock.mockReset()
  })

  it('lists offerings with category and available seats', async () => {
    listOfferingsMock.mockResolvedValue(
      page([
        offering({}),
        offering({
          sectionId: 2,
          subject: { id: 2, code: 'ET601', name: 'Empreendedorismo', workloadHours: 45 },
          category: 'FREE_ELECTIVE',
          capacity: 1,
          occupiedSeats: 1,
          availableSeats: 0,
        }),
      ]),
    )

    renderPage()

    expect(await screen.findByText('Introdução à Programação')).toBeInTheDocument()
    expect(screen.getByText('Obrigatória')).toBeInTheDocument()
    expect(screen.getByText('2 de 40')).toBeInTheDocument()
    expect(screen.getByText('Eletiva livre')).toBeInTheDocument()
    expect(screen.getByText('Lotada')).toBeInTheDocument()
  })

  it('shows an empty state when there are no offerings', async () => {
    listOfferingsMock.mockResolvedValue(page([]))

    renderPage()

    expect(await screen.findByText('Nenhuma turma ofertada neste semestre.')).toBeInTheDocument()
  })

  it('reads the search from the URL and reports when nothing was found', async () => {
    listOfferingsMock.mockResolvedValue(page([]))

    renderPage('/aluno/ofertas?busca=quimica')

    expect(await screen.findByText('Nenhuma turma encontrada para "quimica".')).toBeInTheDocument()
    expect(listOfferingsMock).toHaveBeenCalledWith({ search: 'quimica', page: 1 })
  })

  it('writes the search to the URL and resets the page', async () => {
    listOfferingsMock.mockResolvedValue(page([offering({})]))
    renderPage('/aluno/ofertas?pagina=3')
    await screen.findByText('Introdução à Programação')

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Buscar por código ou nome da disciplina' }),
      'IF6',
    )

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('?busca=IF6'))
  })

  it('offers a retry when the server cannot be reached', async () => {
    listOfferingsMock.mockRejectedValueOnce(new AxiosError('Network Error'))
    listOfferingsMock.mockResolvedValueOnce(page([offering({})]))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível se comunicar com o servidor.',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByText('Introdução à Programação')).toBeInTheDocument()
  })
})
