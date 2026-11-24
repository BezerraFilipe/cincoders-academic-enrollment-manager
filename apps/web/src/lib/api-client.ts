import axios from 'axios'
import { clearSession, readSession } from '../features/auth/session-storage'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
})

apiClient.interceptors.request.use((config) => {
  const token = readSession()?.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const isUnauthorized = axios.isAxiosError(error) && error.response?.status === 401
    const isLoginRequest = axios.isAxiosError(error) && error.config?.url === '/auth/login'

    if (isUnauthorized && !isLoginRequest && readSession()) {
      clearSession()
      window.location.assign('/login?sessao=expirada')
    }

    return Promise.reject(error)
  },
)
