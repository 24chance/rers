import { api } from './client'
import type { Review, ReviewAssignment, ReviewRecommendation } from '@/types'

export interface SubmitReviewDto {
  comments: string
  recommendation: ReviewRecommendation
  conditions?: string
}

export const reviewsApi = {
  getAssignments: async (): Promise<ReviewAssignment[]> => {
    const response = await api.get<{ data: ReviewAssignment[] }>('/reviews/assignments')
    return response.data.data
  },

  getReview: async (id: string): Promise<Review> => {
    const response = await api.get<{ data: Review }>(`/reviews/${id}`)
    return response.data.data
  },

  openAssignmentReview: async (assignmentId: string): Promise<Review> => {
    const response = await api.post<{ data: Review }>(
      `/reviews/assignments/${assignmentId}/open`,
    )
    return response.data.data
  },

  submitReview: async (id: string, dto: SubmitReviewDto): Promise<Review> => {
    const response = await api.patch<{ data: Review }>(`/reviews/${id}/submit`, dto)
    return response.data.data
  },

  getApplicationReviews: async (appId: string): Promise<Review[]> => {
    const response = await api.get<{ data: Review[] }>(
      `/reviews/application/${appId}`,
    )
    return response.data.data
  },
}
