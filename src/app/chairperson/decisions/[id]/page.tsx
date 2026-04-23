'use client'

import { use, useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import * as Tabs from '@radix-ui/react-tabs'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  FileText,
  Gavel,
  MessageSquare,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toast'
import { StatusBadge } from '@/components/ui/status-badge'
import { DecisionSummaryCard } from '@/components/workflow/decision-summary-card'
import { QueryThread } from '@/components/workflow/query-thread'
import { ReviewerAssignmentPanel } from '@/components/workflow/reviewer-assignment-panel'
import { StatusTimeline } from '@/components/workflow/status-timeline'
import { DocumentUploader } from '@/components/upload/document-uploader'
import { applicationsApi } from '@/lib/api/applications.api'
import { decisionsApi } from '@/lib/api/decisions.api'
import { queriesApi } from '@/lib/api/queries.api'
import { reviewsApi } from '@/lib/api/reviews.api'
import { type Application, ApplicationStatus, DecisionType } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

type DetailField = {
  label: string
  value: unknown
}

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

export default function ChairpersonDecisionDetailPage({ params }: Props) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [decisionModalOpen, setDecisionModalOpen] = useState(false)
  const [decisionType, setDecisionType] = useState<DecisionType>(DecisionType.APPROVED)
  const [decisionRationale, setDecisionRationale] = useState('')
  const [decisionConditions, setDecisionConditions] = useState('')

  const { data: application, isLoading: applicationLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationsApi.getApplication(id),
    enabled: !!id,
  })

  const { data: timeline } = useQuery({
    queryKey: ['application-timeline', id],
    queryFn: () => applicationsApi.getApplicationTimeline(id),
    enabled: !!id && activeTab === 'overview',
  })

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['application-reviews', id],
    queryFn: () => reviewsApi.getApplicationReviews(id),
    enabled: !!id,
  })

  const { data: documents = [] } = useQuery({
    queryKey: ['application-documents', id],
    queryFn: () => applicationsApi.getApplicationDocuments(id),
    enabled: !!id && activeTab === 'documents',
  })

  const { data: queries = [] } = useQuery({
    queryKey: ['application-queries', id],
    queryFn: () => queriesApi.getQueries(id),
    enabled: !!id && activeTab === 'queries',
  })

  const { data: decision, isLoading: decisionLoading } = useQuery({
    queryKey: ['decision', id],
    queryFn: () => decisionsApi.getDecision(id),
    enabled: !!id,
    retry: false,
  })

  const decisionMutation = useMutation({
    mutationFn: () =>
      decisionsApi.recordDecision(id, {
        type: decisionType,
        rationale: decisionRationale,
        conditions: decisionType === DecisionType.CONDITIONALLY_APPROVED
          ? decisionConditions || undefined
          : undefined,
      }),
    onSuccess: () => {
      toast.success('Decision recorded.')
      setDecisionModalOpen(false)
      setDecisionRationale('')
      setDecisionConditions('')
      setDecisionType(DecisionType.APPROVED)
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      queryClient.invalidateQueries({ queryKey: ['decision', id] })
      queryClient.invalidateQueries({ queryKey: ['chairperson-applications'] })
      queryClient.invalidateQueries({ queryKey: ['chairperson-dashboard-applications'] })
      queryClient.invalidateQueries({ queryKey: ['chairperson-pending-decisions'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to record decision.')
    },
  })

  if (applicationLoading || decisionLoading) {
    return <Loader centered label="Loading application workspace..." />
  }

  if (!application) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-sm text-slate-500">Application not found.</p>
        <Link href="/chairperson/decisions">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Applications
          </Button>
        </Link>
      </div>
    )
  }

  const completedReviews = reviews.filter((review) => review.isComplete)
  const pendingReviews = reviews.length - completedReviews.length
  const canRecordDecision =
    !decision &&
    [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.DECISION_PENDING].includes(application.status)

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

  const tabClass = (tab: string) =>
    clsx(
      'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
      activeTab === tab
        ? 'border-rnec-teal text-rnec-teal'
        : 'border-transparent text-slate-500 hover:text-slate-700',
    )

  return (
    <div className="max-w-7xl space-y-6">
      <div className="space-y-4">
        <Link
          href="/chairperson/decisions"
          className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
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
              Review the complete submission, read reviewer comments, and record the final chairperson decision.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
            {canRecordDecision && (
              <Button
                variant="primary"
                className="sm:self-end"
                onClick={() => setDecisionModalOpen(true)}
                leftIcon={<Gavel className="h-4 w-4" />}
              >
                Record Decision
              </Button>
            )}
          </div>
        </div>
      </div>

      {decision && <DecisionSummaryCard decision={decision} />}

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex overflow-x-auto border-b border-slate-200">
          <Tabs.Trigger value="overview" className={tabClass('overview')}>
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger value="documents" className={tabClass('documents')}>
            Documents
          </Tabs.Trigger>
          <Tabs.Trigger value="reviewers" className={tabClass('reviewers')}>
            Reviewer Feedback
          </Tabs.Trigger>
          <Tabs.Trigger value="queries" className={tabClass('queries')}>
            Queries
            {queries.length > 0 && (
              <span className="ml-1.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                {queries.length}
              </span>
            )}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" className="pt-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
            <div className="space-y-6">
              <Card shadow="sm">
                <CardHeader>
                  <h2 className="text-base font-semibold text-slate-900">Application Snapshot</h2>
                </CardHeader>
                <CardBody>
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
                <CardBody>
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
            </div>

            <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
              <Card shadow="sm">
                <CardHeader>
                  <h2 className="text-base font-semibold text-slate-900">Decision Readiness</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  <SummaryLine label="Total reviews" value={String(reviews.length)} />
                  <SummaryLine label="Completed reviews" value={String(completedReviews.length)} />
                  <SummaryLine label="Pending reviews" value={String(Math.max(pendingReviews, 0))} />
                  <SummaryLine
                    label="Decision status"
                    value={decision ? formatEnumLabel(decision.type) : 'Not yet recorded'}
                  />

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">Before deciding, check:</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      <li className="flex gap-2">
                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-rnec-teal" />
                        Reviewer comments and recommendations.
                      </li>
                      <li className="flex gap-2">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-rnec-teal" />
                        Ethical safeguards, consent, and participant protections.
                      </li>
                      <li className="flex gap-2">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-rnec-teal" />
                        Supporting documents and any unresolved queries.
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('reviewers')}
                      leftIcon={<MessageSquare className="h-4 w-4" />}
                    >
                      Read Reviewer Comments
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('documents')}
                      leftIcon={<FileText className="h-4 w-4" />}
                    >
                      Open Supporting Documents
                    </Button>
                    {canRecordDecision && (
                      <Button
                        variant="primary"
                        onClick={() => setDecisionModalOpen(true)}
                        leftIcon={<Gavel className="h-4 w-4" />}
                      >
                        Record Final Decision
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Card shadow="sm">
                <CardHeader>
                  <h2 className="text-base font-semibold text-slate-900">Workflow History</h2>
                </CardHeader>
                <CardBody>
                  {timeline ? (
                    <StatusTimeline transitions={timeline} />
                  ) : (
                    <Loader size="sm" centered />
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="documents" className="pt-6">
          <Card shadow="sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Supporting Documents</h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Review the full document pack submitted with this application.
                  </p>
                </div>
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
        </Tabs.Content>

        <Tabs.Content value="reviewers" className="pt-6">
          <Card shadow="sm">
            <CardHeader>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Reviewer Feedback</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Comments, recommendations, and conditions submitted by assigned reviewers.
                </p>
              </div>
            </CardHeader>
            <CardBody>
              {reviewsLoading ? (
                <Loader centered label="Loading reviewer feedback..." />
              ) : reviews.length > 0 ? (
                <ReviewerAssignmentPanel
                  applicationId={id}
                  currentReviews={reviews}
                  allowAssignment={false}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
                  <p className="text-sm font-medium text-slate-700">No reviewer feedback yet.</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Assigned reviews will appear here as soon as reviewers begin submitting comments.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="queries" className="pt-6">
          <Card shadow="sm">
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900">Queries and Responses</h2>
            </CardHeader>
            <CardBody>
              <QueryThread applicationId={id} queries={queries} canRespond={false} />
            </CardBody>
          </Card>
        </Tabs.Content>
      </Tabs.Root>

      <Modal
        open={decisionModalOpen}
        onOpenChange={setDecisionModalOpen}
        title="Record Final Decision"
        description="Save the chairperson's decision for this application."
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Decision Type"
            required
            value={decisionType}
            onChange={(event) => setDecisionType(event.target.value as DecisionType)}
            options={[
              { value: DecisionType.APPROVED, label: 'Approved' },
              { value: DecisionType.CONDITIONALLY_APPROVED, label: 'Conditionally Approved' },
              { value: DecisionType.REJECTED, label: 'Rejected' },
              { value: DecisionType.DEFERRED, label: 'Deferred' },
            ]}
          />
          <Textarea
            label="Rationale"
            required
            placeholder="Summarize the basis for the final decision..."
            value={decisionRationale}
            onChange={(event) => setDecisionRationale(event.target.value)}
            rows={4}
          />
          {decisionType === DecisionType.CONDITIONALLY_APPROVED && (
            <Textarea
              label="Conditions"
              required
              placeholder="List the conditions that must be met before approval is finalized."
              value={decisionConditions}
              onChange={(event) => setDecisionConditions(event.target.value)}
              rows={3}
            />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDecisionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={decisionMutation.isPending}
              disabled={
                !decisionRationale.trim() ||
                (decisionType === DecisionType.CONDITIONALLY_APPROVED && !decisionConditions.trim())
              }
              onClick={() => decisionMutation.mutate()}
              leftIcon={<Gavel className="h-4 w-4" />}
            >
              Record Decision
            </Button>
          </div>
        </div>
      </Modal>
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

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
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
