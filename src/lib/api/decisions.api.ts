import { api } from './client'
import type { Decision, DecisionType } from '@/types'

export interface RecordDecisionDto {
  type: DecisionType
  conditions?: string
  rationale: string
}

export const decisionsApi = {
  recordDecision: async (appId: string, dto: RecordDecisionDto): Promise<Decision> => {
    const response = await api.post<Decision>(`/applications/${appId}/decision`, dto)
    return response.data
  },

  getDecision: async (appId: string): Promise<Decision> => {
    const response = await api.get<Decision>(`/applications/${appId}/decision`)
    return response.data
  },
}
