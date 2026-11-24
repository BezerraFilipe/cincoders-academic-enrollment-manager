import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'
import { getErrorMessage, NETWORK_ERROR_MESSAGE, UNEXPECTED_ERROR_MESSAGE } from './api-error'

function httpError(status: number, data: unknown) {
  return new AxiosError('error', String(status), undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  })
}

describe('getErrorMessage', () => {
  it('shows the API message for an expected business error', () => {
    const error = httpError(422, {
      statusCode: 422,
      code: 'SECTION_FULL',
      message: 'Turma lotada.',
    })

    expect(getErrorMessage(error)).toBe('Turma lotada.')
  })

  it('hides technical messages of unknown routes', () => {
    const error = httpError(404, {
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Cannot POST /auth/login',
    })

    expect(getErrorMessage(error)).toBe(UNEXPECTED_ERROR_MESSAGE)
  })

  it('hides server errors', () => {
    const error = httpError(500, { statusCode: 500, code: 'INTERNAL_SERVER_ERROR', message: 'x' })

    expect(getErrorMessage(error)).toBe(UNEXPECTED_ERROR_MESSAGE)
  })

  it('reports a network failure when there is no response', () => {
    expect(getErrorMessage(new AxiosError('Network Error'))).toBe(NETWORK_ERROR_MESSAGE)
  })
})
