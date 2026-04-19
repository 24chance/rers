import { api } from './client'
import type { Certificate, PaginatedResponse } from '@/types'

export interface RegistryEntry {
  id: string
  referenceNumber: string
  title: string
  applicantName: string
  institutionName: string
  approvalDate: string
  expiryDate?: string
  certificateNumber: string
  status: string
}

export interface GetRegistryParams {
  page?: number
  limit?: number
  search?: string
  tenantId?: string
  status?: string
}

export const registryApi = {
  getRegistry: async (params?: GetRegistryParams): Promise<PaginatedResponse<RegistryEntry>> => {
    const response = await api.get<PaginatedResponse<RegistryEntry>>('/registry', { params })
    return response.data
  },

  getRegistryEntry: async (id: string): Promise<RegistryEntry> => {
    const response = await api.get<RegistryEntry>(`/registry/${id}`)
    return response.data
  },

  verifyCertificate: async (
    token: string,
  ): Promise<Certificate & { applicationTitle: string; isValid: boolean }> => {
    const response = await api.get<Certificate & { applicationTitle: string; isValid: boolean }>(
      `/registry/verify/${token}`,
    )
    return response.data
  },
}
