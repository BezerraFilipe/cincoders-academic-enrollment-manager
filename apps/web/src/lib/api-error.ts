import { isAxiosError } from 'axios'

export interface ApiErrorBody {
  statusCode: number
  code: string
  message: string
  details?: unknown
}

export const NETWORK_ERROR_MESSAGE = 'Não foi possível se comunicar com o servidor.'
export const UNEXPECTED_ERROR_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente.'

const GENERIC_CODES = new Set(['NOT_FOUND', 'INTERNAL_SERVER_ERROR'])

export function getApiError(error: unknown): ApiErrorBody | null {
  if (isAxiosError<ApiErrorBody>(error) && error.response?.data?.code) {
    return error.response.data
  }
  return null
}

export function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error) || !error.response) return NETWORK_ERROR_MESSAGE

  const apiError = getApiError(error)
  const isExpected = apiError && error.response.status < 500 && !GENERIC_CODES.has(apiError.code)

  return isExpected ? apiError.message : UNEXPECTED_ERROR_MESSAGE
}
