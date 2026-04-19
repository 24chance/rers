'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { toast } from '@/components/ui/toast'
import { paymentsApi } from '@/lib/api/payments.api'
import { api } from '@/lib/api/client'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import type { Payment } from '@/lib/api/payments.api'
import type { PaginatedResponse } from '@/types'

async function getAllPayments(page: number): Promise<PaginatedResponse<Payment>> {
  const res = await api.get<PaginatedResponse<Payment>>('/payments', { params: { page, limit: 20 } })
  return res.data
}

export default function FinancePaymentsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [transactionRef, setTransactionRef] = useState('')
  const [notes, setNotes] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['finance-payments', page],
    queryFn: () => getAllPayments(page),
  })

  const verifyMutation = useMutation({
    mutationFn: () =>
      paymentsApi.verifyPayment(selectedPayment!.id, {
        transactionReference: transactionRef,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      toast.success('Payment verified successfully.')
      setVerifyModalOpen(false)
      setSelectedPayment(null)
      setTransactionRef('')
      setNotes('')
      queryClient.invalidateQueries({ queryKey: ['finance-payments'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Verification failed.')
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <p className="text-slate-500 text-sm mt-0.5">Verify and manage application payments</p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">All Payments</h2>
            {data && (
              <span className="text-sm text-slate-400">{data.meta.total} total</span>
            )}
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading payments..." />
          ) : isError ? (
            <EmptyState title="Failed to load" description="Please refresh." />
          ) : !data?.data.length ? (
            <EmptyState title="No payments found" />
          ) : (
            <>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Invoice No.</TableHeader>
                    <TableHeader>Application</TableHeader>
                    <TableHeader>Amount</TableHeader>
                    <TableHeader>Method / Ref</TableHeader>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {data.data.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <span className="font-mono text-xs">{payment.invoiceId.slice(0, 8)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-600">{payment.applicationId.slice(0, 8)}...</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold">
                          {payment.currency} {Number(payment.amount).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{payment.transactionReference || '—'}</span>
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
                            onClick={() => {
                              setSelectedPayment(payment)
                              setVerifyModalOpen(true)
                            }}
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
              {data.meta && (
                <div className="px-4">
                  <Pagination meta={data.meta} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Verify Payment Modal */}
      <Modal
        open={verifyModalOpen}
        onOpenChange={setVerifyModalOpen}
        title="Verify Payment"
        description="Confirm the payment details and verify."
        size="md"
      >
        <div className="space-y-4">
          {selectedPayment && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-semibold">
                  {selectedPayment.currency} {Number(selectedPayment.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Application</span>
                <span className="font-mono text-xs">{selectedPayment.applicationId.slice(0, 12)}</span>
              </div>
            </div>
          )}
          <Input
            label="Transaction Reference"
            required
            placeholder="Bank transaction reference number"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
          />
          <Textarea
            label="Notes (optional)"
            placeholder="Additional verification notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setVerifyModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={verifyMutation.isPending}
              disabled={!transactionRef.trim()}
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
