'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, X, CheckCircle } from 'lucide-react'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Loader } from '@/components/ui/loader'
import { toast } from '@/components/ui/toast'
import { usersApi } from '@/lib/api/users.api'
import { api } from '@/lib/api/client'
import { UserRole } from '@/types'
import type { Review } from '@/types'

interface AssignReviewerDto {
  reviewerId: string
}

async function assignReviewer(appId: string, reviewerId: string): Promise<Review> {
  const res = await api.post<Review>(`/applications/${appId}/reviewers`, { reviewerId })
  return res.data
}

async function removeReviewer(appId: string, reviewerId: string): Promise<void> {
  await api.delete(`/applications/${appId}/reviewers/${reviewerId}`)
}

export interface ReviewerAssignmentPanelProps {
  applicationId: string
  currentReviews?: Review[]
}

export function ReviewerAssignmentPanel({ applicationId, currentReviews = [] }: ReviewerAssignmentPanelProps) {
  const queryClient = useQueryClient()
  const [selectedReviewerId, setSelectedReviewerId] = useState('')

  const { data: reviewersData, isLoading } = useQuery({
    queryKey: ['users', { role: UserRole.REVIEWER }],
    queryFn: () => usersApi.getUsers({ role: UserRole.REVIEWER, limit: 100 }),
  })

  const reviewers = reviewersData?.data ?? []

  const assignedReviewerIds = new Set(currentReviews.map((r) => r.reviewerId))

  const reviewerOptions = [
    { value: '', label: 'Select a reviewer...' },
    ...reviewers
      .filter((r) => !assignedReviewerIds.has(r.id))
      .map((r) => ({
        value: r.id,
        label: `${r.firstName} ${r.lastName} — ${r.email}`,
      })),
  ]

  const assignMutation = useMutation({
    mutationFn: () => assignReviewer(applicationId, selectedReviewerId),
    onSuccess: () => {
      toast.success('Reviewer assigned successfully.')
      setSelectedReviewerId('')
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['application-reviews', applicationId] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to assign reviewer.')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (reviewerId: string) => removeReviewer(applicationId, reviewerId),
    onSuccess: () => {
      toast.success('Reviewer removed.')
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['application-reviews', applicationId] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to remove reviewer.')
    },
  })

  return (
    <div className="space-y-4">
      {/* Current reviewers */}
      {currentReviews.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned Reviewers</p>
          {currentReviews.map((review) => {
            const reviewer = reviewers.find((r) => r.id === review.reviewerId)
            return (
              <div key={review.id} className="flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
                <Avatar
                  firstName={reviewer?.firstName}
                  lastName={reviewer?.lastName}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : review.reviewerId}
                  </p>
                  <p className="text-xs text-slate-400">
                    {review.isComplete ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle className="h-3 w-3" />
                        Review completed
                      </span>
                    ) : (
                      'Review pending'
                    )}
                  </p>
                </div>
                {!review.isComplete && (
                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(review.reviewerId)}
                    disabled={removeMutation.isPending}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    aria-label="Remove reviewer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add reviewer */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Add Reviewer</p>
        {isLoading ? (
          <Loader size="sm" centered={false} />
        ) : (
          <div className="flex gap-2">
            <Select
              options={reviewerOptions}
              value={selectedReviewerId}
              onChange={(e) => setSelectedReviewerId(e.target.value)}
              className="flex-1"
              disabled={reviewerOptions.length <= 1}
            />
            <Button
              variant="primary"
              size="md"
              loading={assignMutation.isPending}
              disabled={!selectedReviewerId}
              onClick={() => assignMutation.mutate()}
              leftIcon={<UserPlus className="h-4 w-4" />}
            >
              Assign
            </Button>
          </div>
        )}
        {reviewerOptions.length <= 1 && !isLoading && (
          <p className="text-xs text-slate-400 mt-1">No additional reviewers available.</p>
        )}
      </div>
    </div>
  )
}
