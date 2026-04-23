import { api } from './client'
import type { Payment } from '@/types'

interface Envelope<T> {
  data: T
}

export interface CreatePaymentDto {
  amount: number
  method?: string
  referenceNumber?: string
  notes?: string
}

export interface VerifyPaymentDto {
  notes?: string
}

export const paymentsApi = {
  getPaymentsByInvoice: async (invoiceId: string): Promise<Payment[]> => {
    const response = await api.get<Envelope<Payment[]>>(
      `/invoices/${invoiceId}/payments`,
    )
    return response.data.data
  },

  getPayments: async (): Promise<Payment[]> => {
    const response = await api.get<Envelope<Payment[]>>('/payments')
    return response.data.data
  },

  createPayment: async (
    invoiceId: string,
    dto: CreatePaymentDto,
  ): Promise<Payment> => {
    const response = await api.post<Envelope<Payment>>(
      `/invoices/${invoiceId}/payments`,
      dto,
    )
    return response.data.data
  },

  verifyPayment: async (paymentId: string, dto: VerifyPaymentDto): Promise<Payment> => {
    const response = await api.patch<Envelope<Payment>>(
      `/payments/${paymentId}/verify`,
      dto,
    )
    return response.data.data
  },
}
