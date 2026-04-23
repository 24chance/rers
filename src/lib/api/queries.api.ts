import { api } from './client'

export interface QueryResponder {
  id: string
  firstName: string
  lastName: string
}

export interface IrbQueryResponse {
  id: string
  queryId: string
  responderId: string | null
  response: string
  createdAt: string
  responder?: QueryResponder | null
}

export interface IrbQuery {
  id: string
  applicationId: string
  raisedById: string | null
  question: string
  isResolved: boolean
  resolvedAt?: string | null
  createdAt: string
  responses: IrbQueryResponse[]
  raisedBy?: QueryResponder | null
}

export const queriesApi = {
  getQueries: async (applicationId: string): Promise<IrbQuery[]> => {
    const response = await api.get<{ data: IrbQuery[] } | IrbQuery[]>(
      `/applications/${applicationId}/queries`,
    )
    const raw = response.data
    return Array.isArray(raw) ? raw : (raw as { data: IrbQuery[] }).data
  },

  respondToQuery: async (
    applicationId: string,
    queryId: string,
    responseText: string,
  ): Promise<IrbQueryResponse> => {
    const response = await api.post<{ data: IrbQueryResponse }>(
      `/applications/${applicationId}/queries/${queryId}/respond`,
      { response: responseText },
    )
    return response.data.data
  },
}
