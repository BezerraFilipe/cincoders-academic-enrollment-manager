import { AxiosError, AxiosHeaders } from 'axios'

export function httpError(status: number, code: string, message: string) {
  return new AxiosError(message, String(status), undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { statusCode: status, code, message },
  })
}
