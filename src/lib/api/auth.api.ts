import { api } from './client'
import type { AuthUser } from '@/types'

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  tenantCode?: string
}

export interface VerifyOtpDto {
  email: string
  otp: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  token: string
  password: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

interface Envelope<T> {
  data: T
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    const response = await api.post<Envelope<AuthUser>>('/auth/login', { email, password })
    return response.data.data
  },

  register: async (dto: RegisterDto): Promise<{ message: string }> => {
    const response = await api.post<Envelope<{ message: string }>>('/auth/register', dto)
    return response.data.data
  },

  verifyOtp: async (email: string, otp: string): Promise<{ message: string }> => {
    const response = await api.post<Envelope<{ message: string }>>('/auth/verify-otp', { email, otp })
    return response.data.data
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<Envelope<{ message: string }>>('/auth/forgot-password', { email })
    return response.data.data
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await api.post<Envelope<{ message: string }>>('/auth/reset-password', {
      token,
      password,
    })
    return response.data.data
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post<Envelope<{ message: string }>>('/auth/change-password', { currentPassword, newPassword })
    return response.data.data
  },

  skipFirstLogin: async (): Promise<{ message: string }> => {
    const response = await api.patch<Envelope<{ message: string }>>('/auth/skip-first-login')
    return response.data.data
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await api.post<Envelope<RefreshTokenResponse>>('/auth/refresh')
    return response.data.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },
}
