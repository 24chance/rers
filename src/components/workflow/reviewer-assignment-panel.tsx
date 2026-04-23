'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, UserPlus, X } from 'lucide-react'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Loader } from '@/components/ui/loader'
import { toast } from '@/components/ui/toast'
import { usersApi } from '@/lib/api/users.api'
import { api } from '@/lib/api/client'
import { UserRole } from '@/types'
import type { Review, ReviewAssignment } from '@/types'

async function getAssignments(applicationId: string): Promise<ReviewAssignment[]> {
  const response = await api.get<{ data: ReviewAssignment[] }>(
    `/applications/${applicationId}/reviewers`,
  )
  return response.data.data
}

async function assignReviewer(
  applicationId: string,
  reviewerId: string,
): Promise<ReviewAssignment> {
  const response = await api.post<{ data: ReviewAssignment }>(
    `/applications/${applicationId}/reviewers`,
    { reviewerId },
  )
  return response.data.data
}

async function deactivateReviewerAssignment(assignmentId: string): Promise<void> {
  await api.patch(`/reviewer-assignments/${assignmentId}/deactivate`)
}

export interface ReviewerAssignmentPanelProps {
  applicationId: string
  currentReviews?: Review[]
  allowAssignment?: boolean
}

function formatRecommendationLabel(recommendation?: string) {
  if (!recommendation) return 'No recommendation recorded'
  return recommendation.replace(/_/g, ' ')
}

export function ReviewerAssignmentPanel({
  applicationId,
  currentReviews = [],
  allowAssignment = true,
}: ReviewerAssignmentPanelProps) {
  const queryClient = useQueryClient()
  const [selectedReviewerId, setSelectedReviewerId] = useState('')

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['application-review-assignments', applicationId],
    queryFn: () => getAssignments(applicationId),
    enabled: !!applicationId,
  })

  const { data: reviewersData, isLoading: reviewersLoading } = useQuery({
    queryKey: ['users', { role: UserRole.REVIEWER }],
    queryFn: () => usersApi.getUsers({ role: UserRole.REVIEWER, limit: 100 }),
    enabled: allowAssignment,
  })

  const reviewers = reviewersData?.data ?? []
  const assignedReviewerIds = new Set(
    assignments.filter((assignment) => assignment.isActive).map((assignment) => assignment.reviewerId),
  )

  const reviewerOptions = [
    { value: '', label: 'Select a reviewer...' },
    ...reviewers
      .filter((reviewer) => !assignedReviewerIds.has(reviewer.id))
      .map((reviewer) => ({
        value: reviewer.id,
        label: `${reviewer.firstName} ${reviewer.lastName} — ${reviewer.email}`,
      })),
  ]

  const assignMutation = useMutation({
    mutationFn: () => assignReviewer(applicationId, selectedReviewerId),
    onSuccess: () => {
      toast.success('Reviewer assigned successfully.')
      setSelectedReviewerId('')
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['application-review-assignments', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['application-reviews', applicationId] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to assign reviewer.')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (assignmentId: string) => deactivateReviewerAssignment(assignmentId),
    onSuccess: () => {
      toast.success('Reviewer assignment removed.')
      queryClient.invalidateQueries({ queryKey: ['application-review-assignments', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['application-reviews', applicationId] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to remove reviewer.')
    },
  })

  const isLoading = assignmentsLoading || reviewersLoading

  return (
    <div className="space-y-4">
      {isLoading ? (
        <Loader size="sm" centered={false} />
      ) : assignments.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Assigned Reviewers
          </p>

          {assignments.map((assignment) => {
            const review = currentReviews.find(
              (entry) => entry.reviewerId === assignment.reviewerId,
            )
            const reviewer =
              assignment.reviewer ?? reviewers.find((entry) => entry.id === assignment.reviewerId)

            return (
              <div
                key={assignment.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    firstName={reviewer?.firstName}
                    lastName={reviewer?.lastName}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {reviewer
                        ? `${reviewer.firstName} ${reviewer.lastName}`
                        : assignment.reviewerId}
                    </p>
                    <p className="text-xs text-slate-400">
                      {reviewer?.email ?? 'Reviewer account'}
                    </p>
                    <div className="mt-2 space-y-1">
                      {review?.isComplete ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle className="h-3 w-3" />
                          Review completed
                        </span>
                      ) : assignment.conflictDeclared ? (
                        <span className="text-xs font-medium text-rose-600">
                          Conflict declared
                        </span>
                      ) : assignment.isActive ? (
                        <span className="text-xs text-slate-400">Review pending</span>
                      ) : (
                        <span className="text-xs text-slate-400">Assignment inactive</span>
                      )}

                      {assignment.dueDate && (
                        <p className="text-xs text-slate-400">
                          Due {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {allowAssignment && assignment.isActive && !review?.isComplete && (
                    <button
                      type="button"
                      onClick={() => removeMutation.mutate(assignment.id)}
                      disabled={removeMutation.isPending}
                      className="text-slate-400 transition-colors hover:text-red-500"
                      aria-label="Remove reviewer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {review?.isComplete && (
                  <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Recommendation
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {formatRecommendationLabel(review.recommendation)}
                        </p>
                      </div>
                      {review.completedAt && (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Submitted
                          </p>
                          <p className="mt-1 text-sm text-slate-900">
                            {new Date(review.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {review.conditions && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Conditions
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                          {review.conditions}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Reviewer Comments
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                        {review.comments?.trim() || 'No reviewer comments were submitted.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No reviewers assigned yet.</p>
      )}

      {allowAssignment && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Add Reviewer
          </p>
          <div className="flex gap-2">
            <Select
              options={reviewerOptions}
              value={selectedReviewerId}
              onChange={(event) => setSelectedReviewerId(event.target.value)}
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
          {reviewerOptions.length <= 1 && !reviewersLoading && (
            <p className="mt-1 text-xs text-slate-400">No additional reviewers available.</p>
          )}
        </div>
      )}
    </div>
  )
}
