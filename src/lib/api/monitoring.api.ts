import { api } from './client'

export interface AmendmentDto {
  title: string
  description: string
  justification: string
  formData?: Record<string, unknown>
}

export interface RenewalDto {
  renewalPeriodMonths: number
  justification: string
  progressSummary: string
}

export interface ProgressReportDto {
  reportingPeriodStart: string
  reportingPeriodEnd: string
  participantsEnrolled: number
  summary: string
  adverseEvents?: string
  protocolDeviations?: string
}

export interface AdverseEventDto {
  eventDate: string
  description: string
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING'
  actionsTaken: string
  outcome?: string
}

export interface ClosureReportDto {
  closureDate: string
  totalParticipants: number
  reasonForClosure: string
  summary: string
  dataRetentionPlan?: string
}

export interface MonitoringRecord {
  id: string
  applicationId: string
  type: string
  status: string
  formData: Record<string, unknown>
  submittedAt?: string
  createdAt: string
}

export const monitoringApi = {
  createAmendment: async (appId: string, dto: AmendmentDto): Promise<MonitoringRecord> => {
    const response = await api.post<MonitoringRecord>(
      `/applications/${appId}/monitoring/amendments`,
      dto,
    )
    return response.data
  },

  createRenewal: async (appId: string, dto: RenewalDto): Promise<MonitoringRecord> => {
    const response = await api.post<MonitoringRecord>(
      `/applications/${appId}/monitoring/renewals`,
      dto,
    )
    return response.data
  },

  createProgressReport: async (appId: string, dto: ProgressReportDto): Promise<MonitoringRecord> => {
    const response = await api.post<MonitoringRecord>(
      `/applications/${appId}/monitoring/progress-reports`,
      dto,
    )
    return response.data
  },

  createAdverseEvent: async (appId: string, dto: AdverseEventDto): Promise<MonitoringRecord> => {
    const response = await api.post<MonitoringRecord>(
      `/applications/${appId}/monitoring/adverse-events`,
      dto,
    )
    return response.data
  },

  createClosureReport: async (appId: string, dto: ClosureReportDto): Promise<MonitoringRecord> => {
    const response = await api.post<MonitoringRecord>(
      `/applications/${appId}/monitoring/closure-reports`,
      dto,
    )
    return response.data
  },
}
