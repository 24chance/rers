import { api } from './client'
import type { Receipt } from '@/types'

interface Envelope<T> {
  data: T
}

export const receiptsApi = {
  getReceipts: async (): Promise<Receipt[]> => {
    const response = await api.get<Envelope<Receipt[]>>('/receipts')
    return response.data.data
  },
}
