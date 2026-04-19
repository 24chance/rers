import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor – attach Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('rnec-auth')
        if (stored) {
          const parsed = JSON.parse(stored) as { state?: { accessToken?: string } }
          const token = parsed?.state?.accessToken
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
      } catch {
        // silently ignore parse errors
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor – normalize errors, handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const data = error.response?.data as Record<string, unknown> | undefined

    // Normalize error shape
    const apiError: ApiError = {
      message:
        (data?.message as string) ??
        error.message ??
        'An unexpected error occurred',
      statusCode: status ?? 0,
      error: (data?.error as string) ?? undefined,
      details: (data?.details as Record<string, string[]>) ?? undefined,
    }

    // Handle 401 Unauthorized
    if (status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('rnec-auth')
      // Avoid redirect loop on login page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(apiError)
  },
)

export { api }
export default api
