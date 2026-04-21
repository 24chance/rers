import { api } from './client'
import type { User, UserRole, PaginatedResponse } from '@/types'

export interface GetUsersParams {
  page?: number
  limit?: number
  role?: UserRole
  search?: string
  tenantId?: string
}

export interface CreateUserDto {
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
}

export interface DeactivateUserResponse {
  message: string
}

export interface UpdateUserDto {
  firstName?: string
  lastName?: string
  phone?: string
}

export const usersApi = {
  createUser: async (dto: CreateUserDto): Promise<User> => {
    const response = await api.post<User>('/users', dto)
    return response.data
  },

  getUsers: async (params?: GetUsersParams): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params })
    return response.data.data
  },

  getUser: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`)
    return response.data
  },

  updateUser: async (id: string, dto: UpdateUserDto): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, dto)
    return response.data
  },

  updateRole: async (id: string, role: UserRole): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/role`, { role })
    return response.data
  },

  deactivateUser: async (id: string): Promise<DeactivateUserResponse> => {
    const response = await api.delete<DeactivateUserResponse>(`/users/${id}`)
    return response.data
  },
}
