import { isAxiosError } from 'axios'

export interface ApiErrorBody {
  statusCode: number
  code: string
  message: string
  details?: unknown
}

export const NETWORK_ERROR_MESSAGE = 'Não foi possível se comunicar com o servidor.'

export function getApiError(error: unknown): ApiErrorBody | null {
  if (isAxiosError<ApiErrorBody>(error) && error.response?.data?.code) {
    return error.response.data
  }
  return null
}

export function getErrorMessage(error: unknown): string {
  return getApiError(error)?.message ?? NETWORK_ERROR_MESSAGE
}
