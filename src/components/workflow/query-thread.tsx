'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Send } from 'lucide-react'
import { clsx } from 'clsx'
import { format } from 'date-fns'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/api/client'

export interface QueryMessage {
  id: string
  applicationId: string
  authorId: string
  authorName: string
  authorRole: string
  message: string
  isQuery: boolean
  createdAt: string
}

export interface QueryThreadProps {
  applicationId: string
  messages: QueryMessage[]
  canRespond?: boolean
}

const responseSchema = z.object({
  message: z.string().min(10, 'Response must be at least 10 characters'),
})

type ResponseForm = z.infer<typeof responseSchema>

async function submitQueryResponse(appId: string, message: string): Promise<QueryMessage> {
  const res = await api.post<QueryMessage>(`/applications/${appId}/queries/respond`, { message })
  return res.data
}

export function QueryThread({ applicationId, messages, canRespond = true }: QueryThreadProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResponseForm>({ resolver: zodResolver(responseSchema) })

  const mutation = useMutation({
    mutationFn: (data: ResponseForm) => submitQueryResponse(applicationId, data.message),
    onSuccess: () => {
      toast.success('Response submitted.')
      reset()
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to submit response.')
    },
  })

  if (!messages.length) {
    return (
      <div className="py-8 text-center">
        <MessageCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No queries raised yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Messages */}
      <div className="space-y-3">
        {messages.map((msg) => {
          const isIRB = !msg.isQuery === false || msg.authorRole === 'IRB_ADMIN'
          return (
            <div
              key={msg.id}
              className={clsx(
                'flex gap-3',
                msg.isQuery ? 'flex-row' : 'flex-row-reverse',
              )}
            >
              <Avatar
                fallback={msg.authorName.slice(0, 2)}
                size="sm"
                className="shrink-0"
              />
              <div className={clsx('max-w-[80%] space-y-1', msg.isQuery ? '' : 'items-end flex flex-col')}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-700">{msg.authorName}</span>
                  <span
                    className={clsx(
                      'text-[10px] font-semibold rounded-full px-1.5 py-0.5',
                      msg.isQuery
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-teal-100 text-teal-700',
                    )}
                  >
                    {msg.isQuery ? 'QUERY' : 'RESPONSE'}
                  </span>
                </div>
                <div
                  className={clsx(
                    'rounded-xl px-4 py-3 text-sm',
                    msg.isQuery
                      ? 'bg-orange-50 border border-orange-100 text-slate-800'
                      : 'bg-rnec-teal/5 border border-rnec-teal/20 text-slate-800',
                  )}
                >
                  {msg.message}
                </div>
                <p className="text-[10px] text-slate-400">
                  {format(new Date(msg.createdAt), 'dd MMM yyyy, HH:mm')}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Response form */}
      {canRespond && (
        <div className="border-t border-slate-100 pt-4">
          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            noValidate
            className="space-y-3"
          >
            <Textarea
              label="Your Response"
              placeholder="Type your response to the IRB query..."
              error={errors.message?.message}
              rows={4}
              {...register('message')}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={mutation.isPending}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Submit Response
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
