import type { RespostaRefresh } from '@features/auth/types'
import { useAuthStore } from '@stores'
import axios from 'axios'

/**
 * Instância centralizada do Axios.
 *
 * Todo acesso HTTP do frontend DEVE usar esta instância — nunca axios direto.
 * O token JWT é injetado automaticamente via interceptor.
 * Quando o access token expira (401), o refresh token é usado automaticamente
 * para renová-lo. Requisições concorrentes são enfileiradas durante o refresh.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void }

let isRefreshing = false
let failedQueue: QueueEntry[] = []

function drainQueue(error: unknown, token: string | null) {
  for (const entry of failedQueue) {
    if (error || !token) entry.reject(error)
    else entry.resolve(token)
  }
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    const originalRequest = error.config as typeof error.config & { _retry?: boolean }
    if (!originalRequest) return Promise.reject(error)

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/api/token/refresh')
    ) {
      if (error.response?.status === 401) {
        useAuthStore.getState().limpar()
      }
      return Promise.reject(error)
    }

    const { refreshToken } = useAuthStore.getState()
    if (!refreshToken) {
      useAuthStore.getState().limpar()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post<RespostaRefresh>(
        `${api.defaults.baseURL ?? ''}/api/token/refresh`,
        { refresh_token: refreshToken }
      )

      useAuthStore.getState().setToken(data.token, data.refresh_token)
      drainQueue(null, data.token)

      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${data.token}`
      return api(originalRequest)
    } catch (refreshError) {
      drainQueue(refreshError, null)

      if (axios.isAxiosError(refreshError) && refreshError.response?.status === 429) {
        return Promise.reject(refreshError)
      }

      useAuthStore.getState().limpar()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)