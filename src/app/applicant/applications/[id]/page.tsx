'use client'

import { use, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, FileText, Download, CreditCard, MessageSquare, Clock } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import { Card, CardBody } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Loader } from '@/components/ui/loader'
import { Button } from '@/components/ui/button'
import { StatusTimeline } from '@/components/workflow/status-timeline'
import { QueryThread } from '@/components/workflow/query-thread'
import { DocumentUploader } from '@/components/upload/document-uploader'
import { applicationsApi } from '@/lib/api/applications.api'
import { paymentsApi } from '@/lib/api/payments.api'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import type { QueryMessage } from '@/components/workflow/query-thread'

interface Props {
  params: Promise<{ id: string }>
}

export default function ApplicationDetailPage({ params }: Props) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState('overview')

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

  const { data: invoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => paymentsApi.getInvoice(id),
    enabled: !!id && activeTab === 'payments',
  })

  if (isLoading) {
    return <Loader centered label="Loading application..." />
  }

  if (!application) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 text-sm mb-4">Application not found.</p>
        <Link href="/applicant/applications">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Applications
          </Button>
        </Link>
      </div>
    )
  }

  // Mock query messages — in production these would come from API
  const queryMessages: QueryMessage[] = []

  const tabClass = (tab: string) =>
    clsx(
      'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
      activeTab === tab
        ? 'border-rnec-teal text-rnec-teal'
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
    )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/applicant/applications"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
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
            <p className="text-sm text-slate-500 mt-0.5">
              {application.type.replace(/_/g, ' ')} •{' '}
              Created {format(new Date(application.createdAt), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex border-b border-slate-200 overflow-x-auto">
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

        {/* Overview tab */}
        <Tabs.Content value="overview" className="pt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card shadow="sm" className="lg:col-span-2">
              <CardBody>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Application Details</h3>
                <div className="space-y-3">
                  {Object.entries(application.formData ?? {})
                    .filter(([, v]) => v !== null && v !== undefined && v !== '')
                    .slice(0, 10)
                    .map(([key, value]) => (
                      <div key={key} className="flex gap-4">
                        <span className="w-40 shrink-0 text-xs font-medium text-slate-500 capitalize">
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
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Workflow History</h3>
                {timeline ? (
                  <StatusTimeline transitions={timeline} />
                ) : (
                  <Loader size="sm" centered />
                )}
              </CardBody>
            </Card>
          </div>
        </Tabs.Content>

        {/* Documents tab */}
        <Tabs.Content value="documents" className="pt-6">
          <Card shadow="sm">
            <CardBody>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Application Documents</h3>
              <DocumentUploader
                applicationId={id}
                existingDocuments={documents ?? []}
                readOnly
              />
            </CardBody>
          </Card>
        </Tabs.Content>

        {/* Queries tab */}
        <Tabs.Content value="queries" className="pt-6">
          <Card shadow="sm">
            <CardBody>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">IRB Queries</h3>
              <QueryThread
                applicationId={id}
                messages={queryMessages}
                canRespond={application.status === 'QUERY_RAISED'}
              />
            </CardBody>
          </Card>
        </Tabs.Content>

        {/* Payments tab */}
        <Tabs.Content value="payments" className="pt-6">
          <Card shadow="sm">
            <CardBody>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Invoice & Payment</h3>
              {invoice ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Invoice Amount</span>
                      <span className="text-sm font-bold text-slate-900">
                        {invoice.currency} {Number(invoice.amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Status</span>
                      <span
                        className={clsx(
                          'text-xs font-semibold rounded-full px-2.5 py-0.5',
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
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Due Date</span>
                        <span className="text-sm text-slate-900">
                          {format(new Date(invoice.dueDate), 'dd MMM yyyy')}
                        </span>
                      </div>
                    )}
                  </div>

                  {invoice.status === 'PENDING' && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Payment Required</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          Please make your payment via bank transfer and contact finance to verify.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
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
