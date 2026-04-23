'use client'

import { useQuery } from '@tanstack/react-query'
import { Receipt as ReceiptIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { receiptsApi } from '@/lib/api/receipts.api'

export default function FinanceReceiptsPage() {
  const { data: receipts = [], isLoading, isError } = useQuery({
    queryKey: ['finance-receipts'],
    queryFn: () => receiptsApi.getReceipts(),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Receipts</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Receipts generated automatically after payment verification.
        </p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">All Receipts</h2>
            <span className="text-sm text-slate-400">{receipts.length} total</span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading receipts..." />
          ) : isError ? (
            <EmptyState title="Failed to load" description="Please refresh the page." />
          ) : !receipts.length ? (
            <EmptyState
              icon={<ReceiptIcon className="h-8 w-8 text-slate-400" />}
              title="No receipts yet"
              description="Receipts will appear here after payments are verified."
            />
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Receipt No.</TableHeader>
                  <TableHeader>Application Ref</TableHeader>
                  <TableHeader>Payer</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Transaction Ref</TableHeader>
                  <TableHeader>Issued</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {receipts.map((receipt) => {
                  const applicant = receipt.payment?.invoice?.application?.applicant

                  return (
                    <TableRow key={receipt.id}>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-rnec-teal">
                          {receipt.receiptNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">
                          {receipt.payment?.invoice?.application?.referenceNumber
                            || receipt.payment?.invoice?.application?.id
                            || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {applicant ? `${applicant.firstName} ${applicant.lastName}` : 'Applicant'}
                          </p>
                          <p className="text-xs text-slate-500">{applicant?.email || '—'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold">
                          {receipt.payment?.invoice?.currency || 'KES'} {Number(receipt.amount).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-slate-600">
                          {receipt.payment?.referenceNumber || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">
                          {format(new Date(receipt.issuedAt), 'dd MMM yyyy')}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
