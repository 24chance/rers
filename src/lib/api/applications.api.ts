import { api } from './client'
import type {
  Application,
  ApplicationDocument,
  ApplicationType,
  DocumentType,
  PaginatedResponse,
  WorkflowTransition,
} from '@/types'

interface BackendPaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface BackendPaginatedResponse<T> {
  data: T[]
  meta: BackendPaginationMeta
}

function normalizePaginatedResponse<T>(
  payload: BackendPaginatedResponse<T>,
): PaginatedResponse<T> {
  const limit = payload.meta.pageSize

  return {
    data: payload.data,
    meta: {
      total: payload.meta.total,
      page: payload.meta.page,
      limit,
      totalPages: payload.meta.totalPages,
      hasNextPage: payload.meta.page < payload.meta.totalPages,
      hasPreviousPage: payload.meta.page > 1,
    },
  }
}

export interface GetApplicationsParams {
  page?: number
  limit?: number
  status?: string
  type?: string
  search?: string
  tenantId?: string
}

export interface CreateApplicationDto {
  title: string
  type: ApplicationType
  tenantId?: string
  principalInvestigator?: string
  coInvestigators?: string[]
  studyDuration?: string
  studyStartDate?: string
  studyEndDate?: string
  population?: string
  sampleSize?: number
  methodology?: string
  fundingSource?: string
  budget?: number
  ethicsStatement?: string
  consentDescription?: string
  formData?: Record<string, unknown>
}

export interface UpdateApplicationDto {
  title?: string
  type?: ApplicationType
  tenantId?: string
  principalInvestigator?: string
  coInvestigators?: string[]
  studyDuration?: string
  studyStartDate?: string
  studyEndDate?: string
  population?: string
  sampleSize?: number
  methodology?: string
  fundingSource?: string
  budget?: number
  ethicsStatement?: string
  consentDescription?: string
  formData?: Record<string, unknown>
}

export const applicationsApi = {
  getApplications: async (
    params?: GetApplicationsParams,
  ): Promise<PaginatedResponse<Application>> => {
    const response = await api.get<{ data: BackendPaginatedResponse<Application> }>(
      '/applications',
      { params },
    )
    return normalizePaginatedResponse(response.data.data)
  },

  getApplication: async (id: string): Promise<Application> => {
    const response = await api.get<{ data: Application }>(`/applications/${id}`)
    return response.data.data
  },

  createApplication: async (dto: CreateApplicationDto): Promise<Application> => {
    const response = await api.post<{ data: Application }>('/applications', dto)
    return response.data.data
  },

  updateApplication: async (id: string, dto: UpdateApplicationDto): Promise<Application> => {
    const response = await api.patch<{ data: Application }>(
      `/applications/${id}`,
      dto,
    )
    return response.data.data
  },

  submitApplication: async (id: string): Promise<Application> => {
    const response = await api.post<{ data: Application }>(
      `/applications/${id}/submit`,
    )
    return response.data.data
  },

  getApplicationTimeline: async (id: string): Promise<WorkflowTransition[]> => {
    const response = await api.get<{
      data: { application: Application; timeline: WorkflowTransition[] }
    }>(
      `/applications/${id}/timeline`,
    )
    return response.data.data.timeline
  },

  getApplicationDocuments: async (id: string): Promise<ApplicationDocument[]> => {
    const response = await api.get<{ data: ApplicationDocument[] }>(
      `/applications/${id}/documents`,
    )
    return response.data.data
  },

  uploadDocument: async (
    id: string,
    file: File,
    documentType: DocumentType,
  ): Promise<ApplicationDocument> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)

    const response = await api.post<{ data: ApplicationDocument }>(
      `/applications/${id}/documents`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    )
    return response.data.data
  },

  deleteApplication: async (id: string): Promise<void> => {
    await api.delete(`/applications/${id}`)
  },

  deleteDocument: async (id: string, docId: string): Promise<void> => {
    await api.delete(`/applications/${id}/documents/${docId}`)
  },
}
