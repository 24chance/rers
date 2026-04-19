import { api } from './client'
import type { Notification, PaginatedResponse } from '@/types'

export interface GetNotificationsParams {
  page?: number
  limit?: number
  isRead?: boolean
}

export const notificationsApi = {
  getNotifications: async (
    params?: GetNotificationsParams,
  ): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get<PaginatedResponse<Notification>>('/notifications', { params })
    return response.data
  },

  markRead: async (id: string): Promise<Notification> => {
    const response = await api.patch<Notification>(`/notifications/${id}/read`)
    return response.data
  },

  markAllRead: async (): Promise<{ updated: number }> => {
    const response = await api.patch<{ updated: number }>('/notifications/read-all')
    return response.data
  },
}
