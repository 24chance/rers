import { api } from './client'
import type { Decision, DecisionType } from '@/types'

export interface RecordDecisionDto {
  type: DecisionType
  conditions?: string
  rationale: string
}

export const decisionsApi = {
  recordDecision: async (appId: string, dto: RecordDecisionDto): Promise<Decision> => {
    const response = await api.post<{ data: Decision }>(
      `/decisions/application/${appId}`,
      dto,
    )
    return response.data.data
  },

  getDecision: async (appId: string): Promise<Decision | null> => {
    const response = await api.get<{ data: Decision[] }>(
      `/decisions/application/${appId}`,
    )
    return response.data.data[0] ?? null
  },
}
