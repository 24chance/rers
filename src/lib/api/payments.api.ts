import { api } from './client'
import type { Invoice } from '@/types'

export interface VerifyPaymentDto {
  transactionReference: string
  proofOfPayment?: File
  notes?: string
}

export interface Payment {
  id: string
  applicationId: string
  invoiceId: string
  transactionReference: string
  amount: number
  currency: string
  status: string
  notes?: string
  verifiedAt?: string
  createdAt: string
}

export const paymentsApi = {
  getInvoice: async (appId: string): Promise<Invoice> => {
    const response = await api.get<Invoice>(`/applications/${appId}/invoice`)
    return response.data
  },

  getPayments: async (appId: string): Promise<Payment[]> => {
    const response = await api.get<Payment[]>(`/applications/${appId}/payments`)
    return response.data
  },

  verifyPayment: async (paymentId: string, dto: VerifyPaymentDto): Promise<Payment> => {
    const formData = new FormData()
    formData.append('transactionReference', dto.transactionReference)
    if (dto.notes) formData.append('notes', dto.notes)
    if (dto.proofOfPayment) formData.append('proofOfPayment', dto.proofOfPayment)

    const response = await api.patch<Payment>(`/payments/${paymentId}/verify`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}
