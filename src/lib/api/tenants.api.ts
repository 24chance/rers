import { api } from './client'
import type { Tenant } from '@/types'

export interface CreateTenantDto {
  name: string
  code: string
  type: string
  logoUrl?: string
}

export interface UpdateTenantDto {
  name?: string
  logoUrl?: string
  isActive?: boolean
}

export const tenantsApi = {
  getTenants: async (): Promise<Tenant[]> => {
    const response = await api.get<Tenant[]>('/tenants')
    return response.data
  },

  getTenant: async (id: string): Promise<Tenant> => {
    const response = await api.get<Tenant>(`/tenants/${id}`)
    return response.data
  },

  createTenant: async (dto: CreateTenantDto): Promise<Tenant> => {
    const response = await api.post<Tenant>('/tenants', dto)
    return response.data
  },

  updateTenant: async (id: string, dto: UpdateTenantDto): Promise<Tenant> => {
    const response = await api.patch<Tenant>(`/tenants/${id}`, dto)
    return response.data
  },
}
