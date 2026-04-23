import { api } from './client'
import type { Invoice } from '@/types'

interface Envelope<T> {
  data: T
}

export interface CreateInvoiceDto {
  amount: number
  description: string
  dueDate?: string
  currency?: string
}

export const invoicesApi = {
  getInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get<Envelope<Invoice[]>>('/invoices')
    return response.data.data
  },

  getApplicationInvoices: async (applicationId: string): Promise<Invoice[]> => {
    const response = await api.get<Envelope<Invoice[]>>(
      `/invoices/application/${applicationId}`,
    )
    return response.data.data
  },

  getApplicationInvoice: async (applicationId: string): Promise<Invoice | null> => {
    const invoices = await invoicesApi.getApplicationInvoices(applicationId)
    return invoices[0] ?? null
  },

  createInvoice: async (
    applicationId: string,
    dto: CreateInvoiceDto,
  ): Promise<Invoice> => {
    const response = await api.post<Envelope<Invoice>>(
      `/invoices/application/${applicationId}`,
      dto,
    )
    return response.data.data
  },
}
