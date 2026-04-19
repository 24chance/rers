import { api } from './client'
import type { Certificate } from '@/types'

export const certificatesApi = {
  getCertificate: async (appId: string): Promise<Certificate> => {
    const response = await api.get<Certificate>(`/applications/${appId}/certificate`)
    return response.data
  },

  downloadCertificate: async (appId: string): Promise<Blob> => {
    const response = await api.get(`/applications/${appId}/certificate/download`, {
      responseType: 'blob',
    })
    return response.data as Blob
  },

  verifyCertificate: async (token: string): Promise<Certificate & { applicationTitle: string }> => {
    const response = await api.get<Certificate & { applicationTitle: string }>(
      `/certificates/verify/${token}`,
    )
    return response.data
  },
}
