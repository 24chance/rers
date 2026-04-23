import { api } from './client'
import type { Tenant } from '@/types'

export interface TenantAdminDto {
  firstName: string
  lastName: string
  email: string
  phone?: string
}

export interface CreateTenantDto {
  name: string
  code: string
  type: string
  logoUrl?: string
  address?: string
  phone?: string
  email?: string
  admin: TenantAdminDto
}

export interface UpdateTenantDto {
  name?: string
  logoUrl?: string
  isActive?: boolean
}

export const tenantsApi = {
  getTenants: async (): Promise<Tenant[]> => {
    const response = await api.get<{ data: { data: Tenant[] } }>('/tenants', {
      params: { pageSize: 100 },
    })
    return response.data.data.data
  },

  getTenant: async (id: string): Promise<Tenant> => {
    const response = await api.get<{ data: Tenant }>(`/tenants/${id}`)
    return response.data.data
  },

  createTenant: async (dto: CreateTenantDto): Promise<Tenant> => {
    const response = await api.post<{ data: Tenant }>('/tenants', dto)
    return response.data.data
  },

  updateTenant: async (id: string, dto: UpdateTenantDto): Promise<Tenant> => {
    const response = await api.patch<{ data: Tenant }>(`/tenants/${id}`, dto)
    return response.data.data
  },
}
