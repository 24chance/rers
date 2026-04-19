import { api } from './client'
import type { User, UserRole, PaginatedResponse } from '@/types'

export interface GetUsersParams {
  page?: number
  limit?: number
  role?: UserRole
  search?: string
  tenantId?: string
}

export interface UpdateUserDto {
  firstName?: string
  lastName?: string
  phone?: string
}

export const usersApi = {
  getUsers: async (params?: GetUsersParams): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params })
    return response.data
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
}
