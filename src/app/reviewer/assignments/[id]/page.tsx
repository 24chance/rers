'use client'

import { use } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Building2, CalendarDays, Microscope, Send, ShieldCheck, UserRound } from 'lucide-react'
import * as RadixRadioGroup from '@radix-ui/react-radio-group'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Loader } from '@/components/ui/loader'
import { toast } from '@/components/ui/toast'
import { DocumentUploader } from '@/components/upload/document-uploader'
import { applicationsApi } from '@/lib/api/applications.api'
import { reviewsApi } from '@/lib/api/reviews.api'
import { type Application, ReviewRecommendation } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

const reviewSchema = z
  .object({
    comments: z.string().min(20, 'Comments must be at least 20 characters'),
    recommendation: z.nativeEnum(ReviewRecommendation),
    conditions: z.string().optional(),
    conflictDeclaration: z.boolean().refine((value) => value === true, {
      message: 'You must declare no conflict of interest to submit',
    }),
  })
  .superRefine((value, ctx) => {
    if (
      value.recommendation === ReviewRecommendation.APPROVE_WITH_CONDITIONS &&
      !value.conditions?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['conditions'],
        message: 'Please list the approval conditions.',
      })
    }
  })

type ReviewForm = z.infer<typeof reviewSchema>

type DetailField = {
  label: string
  value: unknown
}

const recommendations = [
  { value: ReviewRecommendation.APPROVE, label: 'Approve', color: 'text-emerald-700' },
  {
    value: ReviewRecommendation.APPROVE_WITH_CONDITIONS,
    label: 'Approve with Conditions',
    color: 'text-teal-700',
  },
  { value: ReviewRecommendation.REJECT, label: 'Reject', color: 'text-red-700' },
  { value: ReviewRecommendation.DEFER, label: 'Defer', color: 'text-amber-700' },
  { value: ReviewRecommendation.ABSTAIN, label: 'Abstain', color: 'text-slate-700' },
]

const renderedFormKeys = new Set([
  'title',
  'type',
  'tenantId',
  'studyDuration',
  'principalInvestigator',
  'coInvestigators',
  'department',
  'address',
  'population',
  'sampleSize',
  'studyStartDate',
  'studyEndDate',
  'methodology',
  'ethicsStatement',
  'consentDescription',
  'fundingSource',
  'budget',
])

export default function ReviewDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: review, isLoading: reviewLoading } = useQuery({
    queryKey: ['assignment-review', id],
    queryFn: () => reviewsApi.openAssignmentReview(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  })

  const { data: application, isLoading: appLoading } = useQuery({
    queryKey: ['application', review?.applicationId],
    queryFn: () => applicationsApi.getApplication(review!.applicationId),
    enabled: !!review?.applicationId,
  })

  const { data: documents = [] } = useQuery({
    queryKey: ['application-documents', review?.applicationId],
    queryFn: () => applicationsApi.getApplicationDocuments(review!.applicationId),
    enabled: !!review?.applicationId,
  })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      comments: '',
      recommendation: review?.recommendation ?? ReviewRecommendation.APPROVE,
      conditions: review?.conditions ?? '',
      conflictDeclaration: false,
    },
  })

  const selectedRecommendation = useWatch({
    control,
    name: 'recommendation',
  })
  const conflictDeclaration = useWatch({
    control,
    name: 'conflictDeclaration',
  })

  const submitMutation = useMutation({
    mutationFn: (data: ReviewForm) =>
      reviewsApi.submitReview(id, {
        comments: data.comments,
        recommendation: data.recommendation,
        conditions: data.conditions?.trim() ? data.conditions : undefined,
      }),
    onSuccess: () => {
      toast.success('Review submitted successfully.')
      queryClient.invalidateQueries({ queryKey: ['assignment-review', id] })
      queryClient.invalidateQueries({ queryKey: ['reviewer-assignments'] })
      router.push('/reviewer/assignments')
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to submit review.')
    },
  })

  const isLoading = reviewLoading || appLoading

  if (isLoading) {
    return <Loader centered label="Opening review workspace..." />
  }

  if (!review || !application) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-sm text-slate-500">Review workspace not found.</p>
        <Link href="/reviewer/assignments">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Assignments
          </Button>
        </Link>
      </div>
    )
  }

  const formData = application.formData ?? {}
  const applicantName = application.applicant
    ? `${application.applicant.firstName} ${application.applicant.lastName}`
    : undefined
  const applicantInstitution = application.tenant?.name
  const principalInvestigator = getApplicationValue(application, 'principalInvestigator')
  const coInvestigators = getApplicationValue(application, 'coInvestigators')
  const department = getApplicationValue(application, 'department')
  const address = getApplicationValue(application, 'address')
  const population = getApplicationValue(application, 'population')
  const methodology = getApplicationValue(application, 'methodology')
  const ethicsStatement = getApplicationValue(application, 'ethicsStatement')
  const consentDescription = getApplicationValue(application, 'consentDescription')
  const summaryFields: DetailField[] = [
    { label: 'Application title', value: application.title },
    { label: 'Application type', value: formatEnumLabel(application.type) },
    {
      label: 'Reference number',
      value: application.referenceNumber || application.id,
    },
    { label: 'Submission status', value: formatEnumLabel(application.status) },
    { label: 'Submitted on', value: formatDateLabel(application.submittedAt) },
    { label: 'Institution', value: applicantInstitution },
    { label: 'Review destination', value: application.destination?.name },
    { label: 'Applicant', value: applicantName },
    { label: 'Applicant email', value: application.applicant?.email },
    { label: 'Principal investigator', value: principalInvestigator },
    { label: 'Co-investigators', value: coInvestigators },
  ]
  const studyFields: DetailField[] = [
    { label: 'Study duration', value: getApplicationValue(application, 'studyDuration') },
    { label: 'Study start date', value: formatDateLabel(getApplicationValue(application, 'studyStartDate')) },
    { label: 'Study end date', value: formatDateLabel(getApplicationValue(application, 'studyEndDate')) },
    { label: 'Department', value: department },
    { label: 'Address', value: address },
    {
      label: 'Sample size',
      value: formatNumberLabel(getApplicationValue(application, 'sampleSize')),
    },
  ]
  const fundingFields: DetailField[] = [
    { label: 'Funding source', value: getApplicationValue(application, 'fundingSource') },
    { label: 'Budget', value: formatCurrencyLabel(getApplicationValue(application, 'budget')) },
  ]
  const additionalFields = Object.entries(formData)
    .filter(([key, value]) => !renderedFormKeys.has(key) && hasDisplayValue(value))
    .map(([key, value]) => ({
      label: formatKeyLabel(key),
      value,
    }))

  return (
    <div className="max-w-7xl space-y-6">
      <div className="space-y-4">
        <Link
          href="/reviewer/assignments"
          className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </Link>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm font-semibold text-slate-500">
                {application.referenceNumber || application.id}
              </span>
              <StatusBadge status={application.status} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{application.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review the full submission, supporting documents, and record your recommendation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[460px]">
            <SummaryStat
              icon={<UserRound className="h-4 w-4 text-rnec-teal" />}
              label="Lead Investigator"
              value={formatDisplayValue(principalInvestigator)}
            />
            <SummaryStat
              icon={<Building2 className="h-4 w-4 text-rnec-teal" />}
              label="Institution"
              value={formatDisplayValue(applicantInstitution)}
            />
            <SummaryStat
              icon={<CalendarDays className="h-4 w-4 text-rnec-teal" />}
              label="Submitted"
              value={formatDateLabel(application.submittedAt)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.95fr)]">
        <div className="space-y-6">
          <Card shadow="sm">
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900">Application Snapshot</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <DetailGrid fields={summaryFields} />
            </CardBody>
          </Card>

          <Card shadow="sm">
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900">Study Design</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <DetailGrid fields={studyFields} />
              <NarrativeField label="Study population" value={population} />
              <NarrativeField label="Methodology" value={methodology} />
            </CardBody>
          </Card>

          <Card shadow="sm">
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900">Ethics and Consent</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <NarrativeField label="Ethics statement" value={ethicsStatement} />
              <NarrativeField label="Consent description" value={consentDescription} />
            </CardBody>
          </Card>

          <Card shadow="sm">
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900">Funding and Logistics</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <DetailGrid fields={fundingFields} />
            </CardBody>
          </Card>

          {additionalFields.length > 0 && (
            <Card shadow="sm">
              <CardHeader>
                <h2 className="text-base font-semibold text-slate-900">Additional Submission Details</h2>
              </CardHeader>
              <CardBody>
                <DetailGrid fields={additionalFields} />
              </CardBody>
            </Card>
          )}

          <Card shadow="sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Supporting Documents</h2>
                <span className="text-xs text-slate-400">
                  {documents.length} {documents.length === 1 ? 'document' : 'documents'}
                </span>
              </div>
            </CardHeader>
            <CardBody>
              <DocumentUploader
                applicationId={application.id}
                existingDocuments={documents}
                readOnly
              />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6">
          <Card shadow="sm">
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900">Review Guide</h2>
            </CardHeader>
            <CardBody>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">
                  Base your recommendation on:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <Microscope className="mt-0.5 h-4 w-4 shrink-0 text-rnec-teal" />
                    Scientific validity, study design, and feasibility.
                  </li>
                  <li className="flex gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-rnec-teal" />
                    Participant safety, ethics, privacy, and informed consent.
                  </li>
                  <li className="flex gap-2">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-rnec-teal" />
                    Institutional readiness, investigator capacity, and documentation quality.
                  </li>
                </ul>
              </div>
            </CardBody>
          </Card>

          {!review.isComplete ? (
            <form onSubmit={handleSubmit((data) => submitMutation.mutate(data))} noValidate>
              <Card shadow="sm">
                <CardHeader>
                  <h2 className="text-base font-semibold text-slate-900">Submit Review</h2>
                </CardHeader>
                <CardBody className="space-y-6">
                  <Textarea
                    label="Review Comments"
                    required
                    placeholder="Summarize the study strengths, ethical concerns, missing details, and the basis for your recommendation."
                    rows={7}
                    error={errors.comments?.message}
                    {...register('comments')}
                  />

                  <div>
                    <p className="mb-3 text-sm font-medium text-slate-700">
                      Recommendation <span className="text-red-500">*</span>
                    </p>
                    <RadixRadioGroup.Root
                      value={selectedRecommendation}
                      onValueChange={(value) =>
                        setValue(
                          'recommendation',
                          value as ReviewRecommendation,
                          { shouldValidate: true },
                        )}
                      className="space-y-2"
                    >
                      {recommendations.map((recommendation) => (
                        <RadixRadioGroup.Item
                          key={recommendation.value}
                          value={recommendation.value}
                          id={`rec-${recommendation.value}`}
                          asChild
                        >
                          <label
                            htmlFor={`rec-${recommendation.value}`}
                            className={clsx(
                              'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors',
                              selectedRecommendation === recommendation.value
                                ? 'border-rnec-teal bg-rnec-teal/5'
                                : 'border-slate-200 hover:border-slate-300',
                            )}
                          >
                            <div
                              className={clsx(
                                'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                                selectedRecommendation === recommendation.value
                                  ? 'border-rnec-teal'
                                  : 'border-slate-300',
                              )}
                            >
                              {selectedRecommendation === recommendation.value && (
                                <div className="h-2 w-2 rounded-full bg-rnec-teal" />
                              )}
                            </div>
                            <span className={clsx('text-sm font-medium', recommendation.color)}>
                              {recommendation.label}
                            </span>
                          </label>
                        </RadixRadioGroup.Item>
                      ))}
                    </RadixRadioGroup.Root>
                    {errors.recommendation && (
                      <p className="mt-1 text-xs text-red-600">{errors.recommendation.message}</p>
                    )}
                  </div>

                  {selectedRecommendation === ReviewRecommendation.APPROVE_WITH_CONDITIONS && (
                    <Textarea
                      label="Conditions"
                      required
                      placeholder="List the revisions or safeguards that must be addressed before approval."
                      rows={4}
                      error={errors.conditions?.message}
                      {...register('conditions')}
                    />
                  )}

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded accent-rnec-teal"
                        checked={conflictDeclaration}
                        onChange={(event) =>
                          setValue(
                            'conflictDeclaration',
                            event.target.checked,
                            { shouldValidate: true },
                          )}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Conflict of Interest Declaration
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          I confirm that I have no conflict of interest and can provide an
                          objective, independent review of this application.
                        </p>
                      </div>
                    </label>
                    {errors.conflictDeclaration && (
                      <p className="mt-2 text-xs text-red-600">
                        {errors.conflictDeclaration.message}
                      </p>
                    )}
                  </div>
                </CardBody>
                <CardFooter>
                  <div className="flex w-full justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      loading={submitMutation.isPending}
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
              <CardHeader>
                <h2 className="text-base font-semibold text-slate-900">Submitted Review</h2>
              </CardHeader>
              <CardBody>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-sm font-medium text-emerald-700">Review submitted</p>
                  <p className="mt-1 text-xs text-emerald-700">
                    Recommendation:{' '}
                    <span className="font-semibold">
                      {formatEnumLabel(review.recommendation)}
                    </span>
                  </p>
                  {review.completedAt && (
                    <p className="mt-1 text-xs text-emerald-600">
                      Submitted on {format(new Date(review.completedAt), 'dd MMM yyyy')}
                    </p>
                  )}
                  {review.conditions && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Conditions
                      </p>
                      <p className="mt-1 text-sm text-emerald-800">{review.conditions}</p>
                    </div>
                  )}
                  {review.comments && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Comments
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-emerald-800">
                        {review.comments}
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}

function DetailGrid({ fields }: { fields: DetailField[] }) {
  const visibleFields = fields.filter((field) => hasDisplayValue(field.value))

  if (visibleFields.length === 0) {
    return <p className="text-sm text-slate-400">No details available.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {visibleFields.map((field) => (
        <div
          key={field.label}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {field.label}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
            {formatDisplayValue(field.value)}
          </p>
        </div>
      ))}
    </div>
  )
}

function NarrativeField({
  label,
  value,
}: {
  label: string
  value: unknown
}) {
  if (!hasDisplayValue(value)) {
    return null
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">
        {formatDisplayValue(value)}
      </p>
    </div>
  )
}

function hasDisplayValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  return true
}

function formatDisplayValue(value: unknown): string {
  if (!hasDisplayValue(value)) {
    return '—'
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(', ')
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (typeof value === 'number') {
    return value.toLocaleString()
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  return String(value)
}

function formatEnumLabel(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }

  return value.replace(/_/g, ' ')
}

function formatDateLabel(value: unknown): string {
  if (!hasDisplayValue(value)) {
    return '—'
  }

  const parsed = new Date(String(value))

  if (Number.isNaN(parsed.getTime())) {
    return String(value)
  }

  return format(parsed, 'dd MMM yyyy')
}

function formatCurrencyLabel(value: unknown): string {
  if (!hasDisplayValue(value)) {
    return '—'
  }

  const numeric = Number(value)

  if (Number.isNaN(numeric)) {
    return String(value)
  }

  return `RWF ${numeric.toLocaleString()}`
}

function formatNumberLabel(value: unknown): string {
  if (!hasDisplayValue(value)) {
    return '—'
  }

  const numeric = Number(value)

  if (Number.isNaN(numeric)) {
    return String(value)
  }

  return numeric.toLocaleString()
}

function getApplicationValue(application: Application, key: string): unknown {
  const topLevelValue = application[key as keyof Application]

  if (hasDisplayValue(topLevelValue)) {
    return topLevelValue
  }

  return application.formData?.[key]
}

function formatKeyLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
}
