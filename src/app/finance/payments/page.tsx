'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { toast } from '@/components/ui/toast'
import { paymentsApi } from '@/lib/api/payments.api'
import type { Payment } from '@/types'

export default function FinancePaymentsPage() {
  const queryClient = useQueryClient()
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [verifyNotes, setVerifyNotes] = useState('')

  const { data: payments = [], isLoading, isError } = useQuery({
    queryKey: ['finance-payments'],
    queryFn: () => paymentsApi.getPayments(),
  })

  const verifyMutation = useMutation({
    mutationFn: () =>
      paymentsApi.verifyPayment(selectedPayment!.id, {
        notes: verifyNotes || undefined,
      }),
    onSuccess: () => {
      toast.success('Payment verified successfully.')
      setSelectedPayment(null)
      setVerifyNotes('')
      queryClient.invalidateQueries({ queryKey: ['finance-payments'] })
      queryClient.invalidateQueries({ queryKey: ['finance-invoices'] })
      queryClient.invalidateQueries({ queryKey: ['finance-receipts'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Verification failed.')
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Review applicant-submitted payments and verify them to release applications for review.
        </p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">All Payments</h2>
            <span className="text-sm text-slate-400">{payments.length} total</span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading payments..." />
          ) : isError ? (
            <EmptyState title="Failed to load" description="Please refresh the page." />
          ) : !payments.length ? (
            <EmptyState title="No payments found" description="Submitted payments will appear here." />
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Application</TableHeader>
                  <TableHeader>Invoice</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Method / Ref</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {payment.invoice?.application?.title || 'Application payment'}
                        </p>
                        <p className="font-mono text-xs text-slate-500">
                          {payment.invoice?.application?.referenceNumber
                            || payment.invoice?.application?.id
                            || '—'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{payment.invoiceId.slice(0, 8)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold">
                        {payment.invoice?.currency || 'KES'} {Number(payment.amount).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs text-slate-700">{payment.method || 'Not specified'}</p>
                        <p className="font-mono text-xs text-slate-500">
                          {payment.referenceNumber || 'No reference provided'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500">
                        {format(new Date(payment.createdAt), 'dd MMM yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={clsx(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                          payment.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : payment.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700',
                        )}
                      >
                        {payment.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {payment.status === 'PENDING' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                          leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                        >
                          Verify
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal
        open={!!selectedPayment}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPayment(null)
            setVerifyNotes('')
          }
        }}
        title="Verify Payment"
        description="Confirm the submitted payment and add any verification notes."
        size="md"
      >
        <div className="space-y-4">
          {selectedPayment && (
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Application</span>
                <span className="font-medium text-slate-900">
                  {selectedPayment.invoice?.application?.referenceNumber || selectedPayment.id}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Amount</span>
                <span className="font-semibold text-slate-900">
                  {selectedPayment.invoice?.currency || 'KES'} {Number(selectedPayment.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono text-xs text-slate-900">
                  {selectedPayment.referenceNumber || 'No reference provided'}
                </span>
              </div>
            </div>
          )}

          <Textarea
            label="Verification Notes"
            placeholder="Optional notes about the verification."
            value={verifyNotes}
            onChange={(event) => setVerifyNotes(event.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPayment(null)
                setVerifyNotes('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={verifyMutation.isPending}
              onClick={() => verifyMutation.mutate()}
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              Verify Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
