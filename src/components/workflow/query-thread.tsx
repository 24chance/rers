'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Send, CheckCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { format } from 'date-fns'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { queriesApi } from '@/lib/api/queries.api'
import type { IrbQuery } from '@/lib/api/queries.api'

export interface QueryThreadProps {
  applicationId: string
  queries: IrbQuery[]
  canRespond?: boolean
}

export function QueryThread({ applicationId, queries, canRespond = false }: QueryThreadProps) {
  const queryClient = useQueryClient()
  const [responseText, setResponseText] = useState<Record<string, string>>({})

  const respondMutation = useMutation({
    mutationFn: ({ queryId, text }: { queryId: string; text: string }) =>
      queriesApi.respondToQuery(applicationId, queryId, text),
    onSuccess: (_, { queryId }) => {
      toast.success('Response submitted.')
      setResponseText((prev) => ({ ...prev, [queryId]: '' }))
      queryClient.invalidateQueries({ queryKey: ['application-queries', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to submit response.')
    },
  })

  if (!queries.length) {
    return (
      <div className="py-8 text-center">
        <MessageCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No queries raised yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {queries.map((query) => {
        const raisedByName = query.raisedBy
          ? `${query.raisedBy.firstName} ${query.raisedBy.lastName}`
          : 'IRB Admin'
        const pendingText = responseText[query.id] ?? ''
        const hasResponded = query.responses.length > 0
        const showResponseForm = canRespond && !query.isResolved

        return (
          <div key={query.id} className="rounded-xl border border-slate-200 overflow-hidden">
            {/* Query header */}
            <div className="bg-orange-50 border-b border-orange-100 px-4 py-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                    Query from {raisedByName}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {format(new Date(query.createdAt), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              </div>
              {query.isResolved && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                  <CheckCircle className="h-3 w-3" />
                  Resolved
                </span>
              )}
            </div>

            {/* Query question */}
            <div className="px-4 py-3 bg-white">
              <p className="text-sm text-slate-800">{query.question}</p>
            </div>

            {/* Responses */}
            {query.responses.length > 0 && (
              <div className="border-t border-slate-100">
                {query.responses.map((res) => {
                  const responderName = res.responder
                    ? `${res.responder.firstName} ${res.responder.lastName}`
                    : 'Applicant'
                  return (
                    <div
                      key={res.id}
                      className="px-4 py-3 bg-teal-50 border-b border-teal-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-rnec-teal">
                          Response from {responderName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(res.createdAt), 'dd MMM yyyy, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-800">{res.response}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Response form */}
            {showResponseForm && (
              <div
                className={clsx(
                  'px-4 py-4 border-t',
                  hasResponded ? 'border-teal-100 bg-teal-50/50' : 'border-slate-100 bg-slate-50',
                )}
              >
                {hasResponded && (
                  <p className="text-xs text-slate-500 mb-3">
                    You can add another response if needed.
                  </p>
                )}
                <Textarea
                  placeholder="Type your response to this query..."
                  value={pendingText}
                  onChange={(e) => setResponseText((prev) => ({ ...prev, [query.id]: e.target.value }))}
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={respondMutation.isPending && respondMutation.variables?.queryId === query.id}
                    disabled={!pendingText.trim()}
                    onClick={() => respondMutation.mutate({ queryId: query.id, text: pendingText })}
                    leftIcon={<Send className="h-3.5 w-3.5" />}
                  >
                    Submit Response
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
