import { api } from './client'
import type { AuthUser, User } from '@/types'

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

export const authApi = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    const response = await api.post<AuthUser>('/auth/login', { email, password })
    return response.data
  },

  register: async (dto: RegisterDto): Promise<User> => {
    const response = await api.post<User>('/auth/register', dto)
    return response.data
  },

  verifyOtp: async (email: string, otp: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/verify-otp', { email, otp })
    return response.data
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    })
    return response.data
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh')
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },
}
