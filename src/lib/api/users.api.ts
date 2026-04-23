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

interface BackendPaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface BackendPaginatedResponse<T> {
  data: T[]
  meta: BackendPaginationMeta
}

interface BackendUserRole {
  id?: string
  name: UserRole
}

type BackendUser = Omit<User, 'role'> & {
  role: UserRole | BackendUserRole
}

function normalizeUser(user: BackendUser): User {
  return {
    ...user,
    role: typeof user.role === 'string' ? user.role : user.role.name,
  }
}

function normalizePaginatedResponse<T>(
  payload: BackendPaginatedResponse<T>,
): PaginatedResponse<T> {
  const limit = payload.meta.pageSize

  return {
    data: payload.data,
    meta: {
      total: payload.meta.total,
      page: payload.meta.page,
      limit,
      totalPages: payload.meta.totalPages,
      hasNextPage: payload.meta.page < payload.meta.totalPages,
      hasPreviousPage: payload.meta.page > 1,
    },
  }
}

export const usersApi = {
  createUser: async (dto: CreateUserDto): Promise<User> => {
    const response = await api.post<BackendUser>('/users', dto)
    return normalizeUser(response.data)
  },

  getUsers: async (params?: GetUsersParams): Promise<PaginatedResponse<User>> => {
    const { limit, ...rest } = params ?? {}
    const response = await api.get<{ data: BackendPaginatedResponse<BackendUser> }>('/users', {
      params: {
        ...rest,
        ...(limit !== undefined ? { pageSize: limit } : {}),
      },
    })
    const normalized = normalizePaginatedResponse(response.data.data)

    return {
      ...normalized,
      data: normalized.data.map(normalizeUser),
    }
  },

  getUser: async (id: string): Promise<User> => {
    const response = await api.get<BackendUser>(`/users/${id}`)
    return normalizeUser(response.data)
  },

  updateUser: async (id: string, dto: UpdateUserDto): Promise<User> => {
    const response = await api.patch<BackendUser>(`/users/${id}`, dto)
    return normalizeUser(response.data)
  },

  updateRole: async (id: string, role: UserRole): Promise<User> => {
    const response = await api.patch<BackendUser>(`/users/${id}/role`, { role })
    return normalizeUser(response.data)
  },

  deactivateUser: async (id: string): Promise<DeactivateUserResponse> => {
    const response = await api.delete<DeactivateUserResponse>(`/users/${id}`)
    return response.data
  },
}
