import { api } from './client'
import type { UserRole } from '@/types'

export interface ApplicantDashboard {
  totalApplications: number
  draftApplications: number
  underReviewApplications: number
  approvedApplications: number
  recentApplications: Array<{
    id: string
    referenceNumber: string | null
    title: string
    status: string
    updatedAt: string
  }>
}

export interface ReviewerDashboard {
  assignedReviews: number
  completedReviews: number
  pendingReviews: number
  recentAssignments: Array<{
    id: string
    applicationId: string
    applicationTitle: string
    deadline?: string
    isComplete: boolean
  }>
}

export interface AdminDashboard {
  totalApplications: number
  pendingScreening: number
  underReview: number
  decisionsThisMonth: number
  applicationsByStatus: Array<{ status: string; count: number }>
  applicationsByType: Array<{ type: string; count: number }>
  recentActivity: Array<{
    applicationId: string
    referenceNumber: string
    action: string
    actorName: string
    createdAt: string
  }>
}

export type DashboardData = ApplicantDashboard | ReviewerDashboard | AdminDashboard

export const dashboardsApi = {
  getDashboard: async (role: UserRole): Promise<DashboardData> => {
    const response = await api.get<{ data: DashboardData }>(
      `/dashboards/${role.toLowerCase()}`,
    )
    return response.data.data
  },
}
