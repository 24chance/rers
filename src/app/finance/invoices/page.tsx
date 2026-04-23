'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'
import { applicationsApi } from '@/lib/api/applications.api'
import { invoicesApi } from '@/lib/api/invoices.api'
import { ApplicationStatus } from '@/types'

export default function FinanceInvoicesPage() {
  const queryClient = useQueryClient()
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [currency, setCurrency] = useState('KES')
  const [dueDate, setDueDate] = useState('')

  const { data: invoices = [], isLoading: invoicesLoading, isError: invoicesError } = useQuery({
    queryKey: ['finance-invoices'],
    queryFn: () => invoicesApi.getInvoices(),
  })

  const { data: pendingApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['finance-applications-awaiting-invoice'],
    queryFn: () => applicationsApi.getApplications({ status: ApplicationStatus.PAYMENT_PENDING, limit: 50 }),
  })

  const pendingApplicationsWithoutInvoice = useMemo(() => {
    const invoicedApplicationIds = new Set(invoices.map((invoice) => invoice.applicationId))
    return (pendingApplications?.data ?? []).filter(
      (application) => !invoicedApplicationIds.has(application.id),
    )
  }, [invoices, pendingApplications?.data])

  const selectedApplication = pendingApplicationsWithoutInvoice.find(
    (application) => application.id === selectedApplicationId,
  )

  const createInvoiceMutation = useMutation({
    mutationFn: () =>
      invoicesApi.createInvoice(selectedApplicationId!, {
        amount: Number(amount),
        description,
        currency: currency || undefined,
        dueDate: dueDate || undefined,
      }),
    onSuccess: () => {
      toast.success('Invoice created successfully.')
      setSelectedApplicationId(null)
      setAmount('')
      setDescription('')
      setCurrency('KES')
      setDueDate('')
      queryClient.invalidateQueries({ queryKey: ['finance-invoices'] })
      queryClient.invalidateQueries({ queryKey: ['finance-applications-awaiting-invoice'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to create invoice.')
    },
  })

  const isLoading = invoicesLoading || applicationsLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Create invoices for screened applications and monitor all issued invoices.
        </p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Awaiting Invoice Creation</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Applications already screened by the IRB and waiting for finance action
              </p>
            </div>
            <span className="text-sm text-slate-400">
              {pendingApplicationsWithoutInvoice.length} pending
            </span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading applications..." />
          ) : !pendingApplicationsWithoutInvoice.length ? (
            <EmptyState
              icon={<FileText className="h-8 w-8 text-slate-400" />}
              title="No applications awaiting invoices"
              description="New screened applications will appear here when they are ready for finance."
            />
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Ref No.</TableHeader>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Submitted</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {pendingApplicationsWithoutInvoice.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold">
                        {application.referenceNumber || application.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-1 text-sm font-medium text-slate-900">
                        {application.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600">
                        {application.type.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500">
                        {application.submittedAt
                          ? format(new Date(application.submittedAt), 'dd MMM yyyy')
                          : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedApplicationId(application.id)}
                      >
                        Create Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Issued Invoices</h2>
            <span className="text-sm text-slate-400">{invoices.length} total</span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {invoicesLoading ? (
            <Loader centered label="Loading invoices..." />
          ) : invoicesError ? (
            <EmptyState title="Failed to load" description="Please refresh the page." />
          ) : !invoices.length ? (
            <EmptyState
              icon={<FileText className="h-8 w-8 text-slate-400" />}
              title="No invoices yet"
              description="Invoices will appear here after they are created."
            />
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Invoice ID</TableHeader>
                  <TableHeader>Application</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Due Date</TableHeader>
                  <TableHeader>Status</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <span className="font-mono text-xs">{invoice.id.slice(0, 12)}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {invoice.application?.title || invoice.applicationId}
                        </p>
                        <p className="font-mono text-xs text-slate-500">
                          {invoice.application?.referenceNumber || invoice.applicationId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold">
                        {invoice.currency} {Number(invoice.amount).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500">
                        {invoice.dueDate ? format(new Date(invoice.dueDate), 'dd MMM yyyy') : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={clsx(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                          invoice.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : invoice.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600',
                        )}
                      >
                        {invoice.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal
        open={!!selectedApplicationId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApplicationId(null)
          }
        }}
        title="Create Invoice"
        description="Set the invoice details for this application."
        size="lg"
      >
        <div className="space-y-4">
          {selectedApplication && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">{selectedApplication.title}</p>
              <p className="mt-1 font-mono text-xs text-slate-500">
                {selectedApplication.referenceNumber || selectedApplication.id}
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Amount"
              type="number"
              required
              min={1}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <Input
              label="Currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            />
          </div>

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />

          <Textarea
            label="Description"
            required
            placeholder="Describe the review or processing fees covered by this invoice."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedApplicationId(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={createInvoiceMutation.isPending}
              disabled={!selectedApplicationId || !amount || !description.trim()}
              onClick={() => createInvoiceMutation.mutate()}
            >
              Create Invoice
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
