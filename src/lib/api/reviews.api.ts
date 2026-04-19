import { api } from './client'
import type { Review, ReviewRecommendation } from '@/types'

export interface SubmitReviewDto {
  comments: string
  recommendation: ReviewRecommendation
  conditions?: string
}

export const reviewsApi = {
  getAssignments: async (): Promise<Review[]> => {
    const response = await api.get<Review[]>('/reviews/assignments')
    return response.data
  },

  getReview: async (id: string): Promise<Review> => {
    const response = await api.get<Review>(`/reviews/${id}`)
    return response.data
  },

  submitReview: async (id: string, dto: SubmitReviewDto): Promise<Review> => {
    const response = await api.patch<Review>(`/reviews/${id}/submit`, dto)
    return response.data
  },

  getApplicationReviews: async (appId: string): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/applications/${appId}/reviews`)
    return response.data
  },
}
