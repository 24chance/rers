'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Send, FileText, Download } from 'lucide-react'
import * as RadixRadioGroup from '@radix-ui/react-radio-group'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Loader } from '@/components/ui/loader'
import { toast } from '@/components/ui/toast'
import { reviewsApi } from '@/lib/api/reviews.api'
import { applicationsApi } from '@/lib/api/applications.api'
import { ReviewRecommendation } from '@/types'
import { clsx } from 'clsx'
import { format } from 'date-fns'

interface Props {
  params: Promise<{ id: string }>
}

const reviewSchema = z.object({
  comments: z.string().min(20, 'Comments must be at least 20 characters'),
  recommendation: z.nativeEnum(ReviewRecommendation),
  conditions: z.string().optional(),
  conflictDeclaration: z.boolean().refine((v) => v === true, {
    message: 'You must declare no conflict of interest to submit',
  }),
})

type ReviewForm = z.infer<typeof reviewSchema>

const recommendations = [
  { value: ReviewRecommendation.APPROVE, label: 'Approve', color: 'text-emerald-700' },
  { value: ReviewRecommendation.APPROVE_WITH_CONDITIONS, label: 'Approve with Conditions', color: 'text-teal-700' },
  { value: ReviewRecommendation.REJECT, label: 'Reject', color: 'text-red-700' },
  { value: ReviewRecommendation.DEFER, label: 'Defer', color: 'text-amber-700' },
  { value: ReviewRecommendation.ABSTAIN, label: 'Abstain', color: 'text-slate-700' },
]

export default function ReviewDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [conflictDeclared, setConflictDeclared] = useState(false)

  const { data: review, isLoading: reviewLoading } = useQuery({
    queryKey: ['review', id],
    queryFn: () => reviewsApi.getReview(id),
    enabled: !!id,
  })

  const { data: application, isLoading: appLoading } = useQuery({
    queryKey: ['application', review?.applicationId],
    queryFn: () => applicationsApi.getApplication(review!.applicationId),
    enabled: !!review?.applicationId,
  })

  const { data: documents } = useQuery({
    queryKey: ['application-documents', review?.applicationId],
    queryFn: () => applicationsApi.getApplicationDocuments(review!.applicationId),
    enabled: !!review?.applicationId,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      recommendation: ReviewRecommendation.APPROVE,
      conflictDeclaration: false,
    },
  })

  const selectedRecommendation = watch('recommendation')

  const mutation = useMutation({
    mutationFn: (data: ReviewForm) =>
      reviewsApi.submitReview(id, {
        comments: data.comments,
        recommendation: data.recommendation,
        conditions: data.conditions,
      }),
    onSuccess: () => {
      toast.success('Review submitted successfully.')
      queryClient.invalidateQueries({ queryKey: ['review', id] })
      router.push('/reviewer/assignments')
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to submit review.')
    },
  })

  const isLoading = reviewLoading || appLoading

  if (isLoading) return <Loader centered label="Loading review..." />

  if (!review) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-4 text-sm">Review not found.</p>
        <Link href="/reviewer/assignments">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href="/reviewer/assignments"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Review Application</h1>
        {application && (
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="font-mono text-sm text-slate-500">{application.referenceNumber}</span>
            <StatusBadge status={application.status} />
          </div>
        )}
      </div>

      {/* Application details (read-only) */}
      {application && (
        <Card shadow="sm">
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-900">Application Details</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Title</p>
                <p className="mt-0.5 font-medium text-slate-900">{application.title}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Type</p>
                <p className="mt-0.5 text-slate-900">{application.type.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Submitted</p>
                <p className="mt-0.5 text-slate-900">
                  {application.submittedAt
                    ? format(new Date(application.submittedAt), 'dd MMM yyyy')
                    : '—'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Documents */}
      {documents && documents.length > 0 && (
        <Card shadow="sm">
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-900">Documents for Review</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <FileText className="h-5 w-5 text-rnec-teal shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{doc.originalName}</p>
                    <p className="text-xs text-slate-400">{doc.documentType.replace(/_/g, ' ')}</p>
                  </div>
                  <Button variant="ghost" size="icon-sm" aria-label="Download">
                    <Download className="h-4 w-4 text-slate-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Review form — only show if not yet complete */}
      {!review.isComplete ? (
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
          <Card shadow="sm">
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900">Submit Review</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Comments */}
              <Textarea
                label="Review Comments"
                required
                placeholder="Provide your detailed review comments, observations, and recommendations..."
                rows={6}
                error={errors.comments?.message}
                {...register('comments')}
              />

              {/* Recommendation */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">
                  Recommendation <span className="text-red-500">*</span>
                </p>
                <RadixRadioGroup.Root
                  value={selectedRecommendation}
                  onValueChange={(val) => setValue('recommendation', val as ReviewRecommendation)}
                  className="space-y-2"
                >
                  {recommendations.map((rec) => (
                    <RadixRadioGroup.Item
                      key={rec.value}
                      value={rec.value}
                      id={`rec-${rec.value}`}
                      asChild
                    >
                      <label
                        htmlFor={`rec-${rec.value}`}
                        className={clsx(
                          'flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-colors',
                          selectedRecommendation === rec.value
                            ? 'border-rnec-teal bg-rnec-teal/5'
                            : 'border-slate-200 hover:border-slate-300',
                        )}
                      >
                        <div
                          className={clsx(
                            'h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0',
                            selectedRecommendation === rec.value
                              ? 'border-rnec-teal'
                              : 'border-slate-300',
                          )}
                        >
                          {selectedRecommendation === rec.value && (
                            <div className="h-2 w-2 rounded-full bg-rnec-teal" />
                          )}
                        </div>
                        <span className={clsx('text-sm font-medium', rec.color)}>{rec.label}</span>
                      </label>
                    </RadixRadioGroup.Item>
                  ))}
                </RadixRadioGroup.Root>
                {errors.recommendation && (
                  <p className="text-xs text-red-600 mt-1">{errors.recommendation.message}</p>
                )}
              </div>

              {/* Conditions — only if APPROVE_WITH_CONDITIONS */}
              {selectedRecommendation === ReviewRecommendation.APPROVE_WITH_CONDITIONS && (
                <Textarea
                  label="Conditions"
                  required
                  placeholder="List the conditions that must be met for approval..."
                  error={errors.conditions?.message}
                  {...register('conditions')}
                />
              )}

              {/* COI Declaration */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-rnec-teal rounded"
                    checked={conflictDeclared}
                    onChange={(e) => {
                      setConflictDeclared(e.target.checked)
                      setValue('conflictDeclaration', e.target.checked)
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Conflict of Interest Declaration</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      I declare that I have no conflict of interest with this research application and can provide an
                      objective, unbiased review.
                    </p>
                  </div>
                </label>
                {errors.conflictDeclaration && (
                  <p className="text-xs text-red-600 mt-2">{errors.conflictDeclaration.message}</p>
                )}
              </div>
            </CardBody>
            <CardFooter>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={mutation.isPending}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Submit Review
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      ) : (
        <Card shadow="sm">
          <CardBody>
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
              <p className="text-sm font-medium text-emerald-700">Review Submitted</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Recommendation: <span className="font-semibold">{review.recommendation?.replace(/_/g, ' ')}</span>
              </p>
              {review.comments && (
                <p className="text-xs text-emerald-700 mt-2">{review.comments}</p>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
