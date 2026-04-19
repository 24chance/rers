'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, MessageSquare, UserCheck, Gavel } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Loader } from '@/components/ui/loader'
import { toast } from '@/components/ui/toast'
import { StatusTimeline } from '@/components/workflow/status-timeline'
import { ReviewerAssignmentPanel } from '@/components/workflow/reviewer-assignment-panel'
import { DecisionSummaryCard } from '@/components/workflow/decision-summary-card'
import { DocumentUploader } from '@/components/upload/document-uploader'
import { applicationsApi } from '@/lib/api/applications.api'
import { reviewsApi } from '@/lib/api/reviews.api'
import { decisionsApi } from '@/lib/api/decisions.api'
import { ApplicationStatus, DecisionType } from '@/types'
import { api } from '@/lib/api/client'
import { format } from 'date-fns'
import { clsx } from 'clsx'

interface Props {
  params: Promise<{ id: string }>
}

async function screenApplication(appId: string, approve: boolean, queryText?: string) {
  if (approve) {
    return api.post(`/applications/${appId}/screen`, { approved: true })
  } else {
    return api.post(`/applications/${appId}/queries`, { message: queryText })
  }
}

export default function IrbApplicationDetailPage({ params }: Props) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')

  // Modals
  const [screenModalOpen, setScreenModalOpen] = useState(false)
  const [queryModalOpen, setQueryModalOpen] = useState(false)
  const [decisionModalOpen, setDecisionModalOpen] = useState(false)
  const [queryText, setQueryText] = useState('')
  const [decisionType, setDecisionType] = useState<DecisionType>(DecisionType.APPROVED)
  const [decisionRationale, setDecisionRationale] = useState('')
  const [decisionConditions, setDecisionConditions] = useState('')

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationsApi.getApplication(id),
    enabled: !!id,
  })

  const { data: timeline } = useQuery({
    queryKey: ['application-timeline', id],
    queryFn: () => applicationsApi.getApplicationTimeline(id),
    enabled: !!id && activeTab === 'overview',
  })

  const { data: reviews } = useQuery({
    queryKey: ['application-reviews', id],
    queryFn: () => reviewsApi.getApplicationReviews(id),
    enabled: !!id,
  })

  const { data: documents } = useQuery({
    queryKey: ['application-documents', id],
    queryFn: () => applicationsApi.getApplicationDocuments(id),
    enabled: !!id && activeTab === 'documents',
  })

  const { data: decision } = useQuery({
    queryKey: ['decision', id],
    queryFn: () => decisionsApi.getDecision(id),
    enabled: !!id,
    retry: false,
  })

  const screenMutation = useMutation({
    mutationFn: (approve: boolean) => screenApplication(id, approve, queryText),
    onSuccess: () => {
      toast.success(queryText ? 'Query raised.' : 'Application screened — payment invoice generated.')
      setScreenModalOpen(false)
      setQueryModalOpen(false)
      setQueryText('')
      queryClient.invalidateQueries({ queryKey: ['application', id] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Action failed.')
    },
  })

  const decisionMutation = useMutation({
    mutationFn: () =>
      decisionsApi.recordDecision(id, {
        type: decisionType,
        rationale: decisionRationale,
        conditions: decisionConditions || undefined,
      }),
    onSuccess: () => {
      toast.success('Decision recorded.')
      setDecisionModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      queryClient.invalidateQueries({ queryKey: ['decision', id] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to record decision.')
    },
  })

  if (isLoading) return <Loader centered label="Loading application..." />

  if (!application) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 text-sm mb-4">Application not found.</p>
        <Link href="/irb-admin/applications">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
        </Link>
      </div>
    )
  }

  const tabClass = (tab: string) =>
    clsx(
      'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
      activeTab === tab
        ? 'border-rnec-teal text-rnec-teal'
        : 'border-transparent text-slate-500 hover:text-slate-700',
    )

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/irb-admin/applications"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <span className="font-mono text-sm font-semibold text-slate-500">
                {application.referenceNumber}
              </span>
              <StatusBadge status={application.status} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">{application.title}</h1>
          </div>

          {/* Action buttons based on status */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {application.status === ApplicationStatus.SUBMITTED && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setScreenModalOpen(true)}
                leftIcon={<CheckCircle className="h-4 w-4" />}
              >
                Screen Application
              </Button>
            )}
            {application.status === ApplicationStatus.UNDER_REVIEW && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQueryModalOpen(true)}
                  leftIcon={<MessageSquare className="h-4 w-4" />}
                >
                  Raise Query
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setDecisionModalOpen(true)}
                  leftIcon={<Gavel className="h-4 w-4" />}
                >
                  Record Decision
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Decision summary if exists */}
      {decision && (
        <DecisionSummaryCard decision={decision} />
      )}

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex border-b border-slate-200 overflow-x-auto">
          <Tabs.Trigger value="overview" className={tabClass('overview')}>Overview</Tabs.Trigger>
          <Tabs.Trigger value="documents" className={tabClass('documents')}>Documents</Tabs.Trigger>
          <Tabs.Trigger value="reviewers" className={tabClass('reviewers')}>Reviewers</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" className="pt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card shadow="sm" className="lg:col-span-2">
              <CardHeader><h2 className="text-base font-semibold">Application Details</h2></CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <FieldRow label="Title" value={application.title} />
                  <FieldRow label="Type" value={application.type.replace(/_/g, ' ')} />
                  <FieldRow label="Status" value={application.status.replace(/_/g, ' ')} />
                  {application.submittedAt && (
                    <FieldRow label="Submitted" value={format(new Date(application.submittedAt), 'dd MMM yyyy')} />
                  )}
                  {Object.entries(application.formData ?? {})
                    .filter(([, v]) => v !== null && v !== undefined && v !== '')
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <FieldRow key={key} label={key.replace(/([A-Z])/g, ' $1')} value={String(value)} />
                    ))}
                </div>
              </CardBody>
            </Card>

            <Card shadow="sm">
              <CardHeader><h2 className="text-base font-semibold">Workflow History</h2></CardHeader>
              <CardBody>
                {timeline ? (
                  <StatusTimeline transitions={timeline} />
                ) : (
                  <Loader size="sm" centered />
                )}
              </CardBody>
            </Card>
          </div>
        </Tabs.Content>

        <Tabs.Content value="documents" className="pt-6">
          <Card shadow="sm">
            <CardHeader><h2 className="text-base font-semibold">Documents</h2></CardHeader>
            <CardBody>
              <DocumentUploader
                applicationId={id}
                existingDocuments={documents ?? []}
                readOnly
              />
            </CardBody>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="reviewers" className="pt-6">
          <Card shadow="sm">
            <CardHeader><h2 className="text-base font-semibold">Reviewer Assignment</h2></CardHeader>
            <CardBody>
              <ReviewerAssignmentPanel
                applicationId={id}
                currentReviews={reviews ?? []}
              />
            </CardBody>
          </Card>
        </Tabs.Content>
      </Tabs.Root>

      {/* Screen modal */}
      <Modal
        open={screenModalOpen}
        onOpenChange={setScreenModalOpen}
        title="Screen Application"
        description="Choose an action for this application."
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Screening this application will generate a payment invoice for the applicant.
            Alternatively, you can raise a query if more information is needed.
          </p>
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              loading={screenMutation.isPending}
              onClick={() => screenMutation.mutate(true)}
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              Approve & Generate Invoice
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setScreenModalOpen(false); setQueryModalOpen(true) }}
              leftIcon={<MessageSquare className="h-4 w-4" />}
            >
              Raise Query
            </Button>
          </div>
        </div>
      </Modal>

      {/* Query modal */}
      <Modal
        open={queryModalOpen}
        onOpenChange={setQueryModalOpen}
        title="Raise Query"
        description="Send a query to the applicant requesting clarification."
        size="md"
      >
        <div className="space-y-4">
          <Textarea
            label="Query Message"
            required
            placeholder="Describe what information or clarification is needed..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setQueryModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={screenMutation.isPending}
              disabled={!queryText.trim()}
              onClick={() => screenMutation.mutate(false)}
              leftIcon={<MessageSquare className="h-4 w-4" />}
            >
              Send Query
            </Button>
          </div>
        </div>
      </Modal>

      {/* Decision modal */}
      <Modal
        open={decisionModalOpen}
        onOpenChange={setDecisionModalOpen}
        title="Record Decision"
        description="Record the IRB decision for this application."
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Decision Type"
            required
            value={decisionType}
            onChange={(e) => setDecisionType(e.target.value as DecisionType)}
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
            placeholder="Provide the rationale for this decision..."
            value={decisionRationale}
            onChange={(e) => setDecisionRationale(e.target.value)}
            rows={4}
          />
          {decisionType === DecisionType.CONDITIONALLY_APPROVED && (
            <Textarea
              label="Conditions"
              placeholder="List the conditions that must be met..."
              value={decisionConditions}
              onChange={(e) => setDecisionConditions(e.target.value)}
              rows={3}
            />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDecisionModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={decisionMutation.isPending}
              disabled={!decisionRationale.trim()}
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

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="w-40 shrink-0 text-xs font-medium text-slate-500 capitalize">{label}</span>
      <span className="text-sm text-slate-900">{value || '—'}</span>
    </div>
  )
}
