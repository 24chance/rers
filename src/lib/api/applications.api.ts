import { api } from './client'
import type {
  Application,
  ApplicationDocument,
  ApplicationType,
  DocumentType,
  PaginatedResponse,
  WorkflowTransition,
} from '@/types'

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
  formData?: Record<string, unknown>
}

export interface UpdateApplicationDto {
  title?: string
  formData?: Record<string, unknown>
}

export const applicationsApi = {
  getApplications: async (
    params?: GetApplicationsParams,
  ): Promise<PaginatedResponse<Application>> => {
    const response = await api.get<PaginatedResponse<Application>>('/applications', { params })
    return response.data
  },

  getApplication: async (id: string): Promise<Application> => {
    const response = await api.get<Application>(`/applications/${id}`)
    return response.data
  },

  createApplication: async (dto: CreateApplicationDto): Promise<Application> => {
    const response = await api.post<Application>('/applications', dto)
    return response.data
  },

  updateApplication: async (id: string, dto: UpdateApplicationDto): Promise<Application> => {
    const response = await api.patch<Application>(`/applications/${id}`, dto)
    return response.data
  },

  submitApplication: async (id: string): Promise<Application> => {
    const response = await api.post<Application>(`/applications/${id}/submit`)
    return response.data
  },

  getApplicationTimeline: async (id: string): Promise<WorkflowTransition[]> => {
    const response = await api.get<WorkflowTransition[]>(`/applications/${id}/timeline`)
    return response.data
  },

  getApplicationDocuments: async (id: string): Promise<ApplicationDocument[]> => {
    const response = await api.get<ApplicationDocument[]>(`/applications/${id}/documents`)
    return response.data
  },

  uploadDocument: async (
    id: string,
    file: File,
    documentType: DocumentType,
  ): Promise<ApplicationDocument> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)

    const response = await api.post<ApplicationDocument>(
      `/applications/${id}/documents`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    )
    return response.data
  },

  deleteDocument: async (id: string, docId: string): Promise<void> => {
    await api.delete(`/applications/${id}/documents/${docId}`)
  },
}
