'use client'

import { Suspense, use, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Clock, CreditCard, Pencil } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import { Card, CardBody } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Loader } from '@/components/ui/loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toast'
import { StatusTimeline } from '@/components/workflow/status-timeline'
import { QueryThread } from '@/components/workflow/query-thread'
import { DocumentUploader } from '@/components/upload/document-uploader'
import { applicationsApi } from '@/lib/api/applications.api'
import { invoicesApi } from '@/lib/api/invoices.api'
import { paymentsApi } from '@/lib/api/payments.api'
import { queriesApi } from '@/lib/api/queries.api'
import { ApplicationStatus } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

function ApplicationDetailPageContent({ params }: Props) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') ?? 'overview')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')

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

  const { data: documents } = useQuery({
    queryKey: ['application-documents', id],
    queryFn: () => applicationsApi.getApplicationDocuments(id),
    enabled: !!id && activeTab === 'documents',
  })

  const { data: queries = [] } = useQuery({
    queryKey: ['application-queries', id],
    queryFn: () => queriesApi.getQueries(id),
    enabled: !!id && activeTab === 'queries',
  })

  const { data: invoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoicesApi.getApplicationInvoice(id),
    enabled: !!id && activeTab === 'payments',
  })

  const { data: payments = [] } = useQuery({
    queryKey: ['invoice-payments', invoice?.id],
    queryFn: () => paymentsApi.getPaymentsByInvoice(invoice!.id),
    enabled: !!invoice?.id && activeTab === 'payments',
  })

  const paymentMutation = useMutation({
    mutationFn: () =>
      paymentsApi.createPayment(invoice!.id, {
        amount: Number(invoice!.amount),
        method: paymentMethod || undefined,
        referenceNumber: paymentReference || undefined,
        notes: paymentNotes || undefined,
      }),
    onSuccess: () => {
      toast.success('Payment submitted successfully. Finance will verify it shortly.')
      setPaymentMethod('')
      setPaymentReference('')
      setPaymentNotes('')
      queryClient.invalidateQueries({ queryKey: ['invoice-payments', invoice?.id] })
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['application', id] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to submit payment.')
    },
  })

  if (isLoading) {
    return <Loader centered label="Loading application..." />
  }

  if (!application) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-sm text-slate-500">Application not found.</p>
        <Link href="/applicant/applications">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Applications
          </Button>
        </Link>
      </div>
    )
  }

  const tabClass = (tab: string) =>
    clsx(
      'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
      activeTab === tab
        ? 'border-rnec-teal text-rnec-teal'
        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
    )

  const canEdit =
    application.status === ApplicationStatus.DRAFT
    || application.status === ApplicationStatus.QUERY_RAISED
  const verifiedPayment = payments.find((payment) => payment.status === 'VERIFIED')
  const pendingPayment = payments.find((payment) => payment.status === 'PENDING')

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/applicant/applications"
          className="mb-4 flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm font-semibold text-slate-500">
                {application.referenceNumber || application.id}
              </span>
              <StatusBadge status={application.status} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">{application.title}</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {application.type.replace(/_/g, ' ')} • Created{' '}
              {format(new Date(application.createdAt), 'dd MMM yyyy')}
            </p>
          </div>

          {canEdit && (
            <Link href={`/applicant/applications/new?edit=${application.id}`}>
              <Button variant="outline" leftIcon={<Pencil className="h-4 w-4" />}>
                {application.status === ApplicationStatus.QUERY_RAISED
                  ? 'Update Application'
                  : 'Edit Draft'}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex overflow-x-auto border-b border-slate-200">
          <Tabs.Trigger value="overview" className={tabClass('overview')}>
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger value="documents" className={tabClass('documents')}>
            Documents
          </Tabs.Trigger>
          <Tabs.Trigger value="queries" className={tabClass('queries')}>
            Queries
          </Tabs.Trigger>
          <Tabs.Trigger value="payments" className={tabClass('payments')}>
            Payments
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card shadow="sm" className="lg:col-span-2">
              <CardBody>
                <h3 className="mb-4 text-sm font-semibold text-slate-900">Application Details</h3>
                <div className="space-y-3">
                  {Object.entries(application.formData ?? {})
                    .filter(([, value]) => value !== null && value !== undefined && value !== '')
                    .slice(0, 12)
                    .map(([key, value]) => (
                      <div key={key} className="flex gap-4">
                        <span className="w-40 shrink-0 text-xs font-medium capitalize text-slate-500">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm text-slate-900">{String(value)}</span>
                      </div>
                    ))}
                </div>
              </CardBody>
            </Card>

            <Card shadow="sm">
              <CardBody>
                <h3 className="mb-4 text-sm font-semibold text-slate-900">Workflow History</h3>
                {timeline ? <StatusTimeline transitions={timeline} /> : <Loader size="sm" centered />}
              </CardBody>
            </Card>
          </div>
        </Tabs.Content>

        <Tabs.Content value="documents" className="pt-6">
          <Card shadow="sm">
            <CardBody>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Application Documents</h3>
              <DocumentUploader applicationId={id} existingDocuments={documents ?? []} readOnly />
            </CardBody>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="queries" className="pt-6">
          <Card shadow="sm">
            <CardBody>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">IRB Queries</h3>
              {application.status === ApplicationStatus.QUERY_RAISED && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Update the application first if you need to revise any details or documents, then reply to the query to send it back for screening.
                </div>
              )}
              <QueryThread
                applicationId={id}
                queries={queries}
                canRespond={application.status === ApplicationStatus.QUERY_RAISED}
              />
            </CardBody>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="payments" className="pt-6">
          <Card shadow="sm">
            <CardBody>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Invoice &amp; Payment</h3>
              {invoice ? (
                <div className="space-y-4">
                  <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-slate-500">Invoice Amount</span>
                      <span className="text-sm font-bold text-slate-900">
                        {invoice.currency} {Number(invoice.amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-slate-500">Invoice Status</span>
                      <span
                        className={clsx(
                          'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          invoice.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : invoice.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700',
                        )}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    {invoice.dueDate && (
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-500">Due Date</span>
                        <span className="text-sm text-slate-900">
                          {format(new Date(invoice.dueDate), 'dd MMM yyyy')}
                        </span>
                      </div>
                    )}
                    {invoice.description && (
                      <div>
                        <p className="text-sm text-slate-500">Description</p>
                        <p className="mt-1 text-sm text-slate-900">{invoice.description}</p>
                      </div>
                    )}
                  </div>

                  {verifiedPayment && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="text-sm font-medium text-emerald-800">Payment Verified</p>
                      <p className="mt-1 text-xs text-emerald-700">
                        Reference: {verifiedPayment.referenceNumber || 'Not provided'}
                      </p>
                    </div>
                  )}

                  {!verifiedPayment && pendingPayment && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                      <p className="text-sm font-medium text-amber-800">Payment Submitted</p>
                      <p className="mt-1 text-xs text-amber-700">
                        Reference: {pendingPayment.referenceNumber || 'Pending confirmation'}.
                        Finance will verify it before the application proceeds.
                      </p>
                    </div>
                  )}

                  {!verifiedPayment && !pendingPayment && invoice.status === 'PENDING' && (
                    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                        <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Payment Required</p>
                          <p className="mt-0.5 text-xs text-amber-600">
                            Submit your payment details below after you complete the transfer or deposit.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Payment Method"
                          placeholder="Bank transfer, mobile money, cash deposit..."
                          value={paymentMethod}
                          onChange={(event) => setPaymentMethod(event.target.value)}
                        />
                        <Input
                          label="Payment Reference"
                          required
                          placeholder="Transaction or slip reference number"
                          value={paymentReference}
                          onChange={(event) => setPaymentReference(event.target.value)}
                        />
                      </div>

                      <Textarea
                        label="Notes"
                        placeholder="Optional notes for the finance team"
                        value={paymentNotes}
                        onChange={(event) => setPaymentNotes(event.target.value)}
                        rows={3}
                      />

                      <div className="flex justify-end">
                        <Button
                          variant="primary"
                          loading={paymentMutation.isPending}
                          disabled={!paymentReference.trim()}
                          onClick={() => paymentMutation.mutate()}
                        >
                          Submit Payment Details
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Clock className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-400">No invoice generated yet.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

export default function ApplicationDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<Loader centered label="Loading application..." />}>
      <ApplicationDetailPageContent params={params} />
    </Suspense>
  )
}
