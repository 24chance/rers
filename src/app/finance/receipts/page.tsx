'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Receipt, Download } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/api/client'
import { format } from 'date-fns'
import { clsx } from 'clsx'

interface PaymentReceipt {
  id: string
  receiptNumber: string
  applicationId: string
  referenceNumber: string
  payerName: string
  payerEmail: string
  amount: number
  currency: string
  transactionReference: string
  verifiedAt: string
  verifiedBy: string
}

interface PaginatedReceipts {
  data: PaymentReceipt[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

async function getReceipts(page: number): Promise<PaginatedReceipts> {
  const res = await api.get<PaginatedReceipts>('/payments/receipts', { params: { page, limit: 20 } })
  return res.data
}

async function downloadReceipt(receiptId: string): Promise<Blob> {
  const res = await api.get<Blob>(`/payments/receipts/${receiptId}/pdf`, { responseType: 'blob' })
  return res.data
}

export default function FinanceReceiptsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['finance-receipts', page],
    queryFn: () => getReceipts(page),
  })

  const handleDownload = async (receipt: PaymentReceipt) => {
    try {
      const blob = await downloadReceipt(receipt.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${receipt.receiptNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download receipt.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Receipts</h1>
        <p className="text-slate-500 text-sm mt-0.5">Verified payment receipts and download history</p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">All Receipts</h2>
            {data && (
              <span className="text-sm text-slate-400">{data.meta.total} total</span>
            )}
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading receipts..." />
          ) : isError ? (
            <EmptyState title="Failed to load" description="Please refresh." />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<Receipt className="h-8 w-8 text-slate-400" />}
              title="No receipts yet"
              description="Receipts are generated when payments are verified."
            />
          ) : (
            <>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Receipt No.</TableHeader>
                    <TableHeader>Application Ref</TableHeader>
                    <TableHeader>Payer</TableHeader>
                    <TableHeader>Amount</TableHeader>
                    <TableHeader>Transaction Ref</TableHeader>
                    <TableHeader>Verified</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {data.data.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-rnec-teal">
                          {receipt.receiptNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{receipt.referenceNumber}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{receipt.payerName}</p>
                          <p className="text-xs text-slate-500">{receipt.payerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold">
                          {Number(receipt.amount).toLocaleString()} {receipt.currency}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-slate-600">{receipt.transactionReference}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">
                          {format(new Date(receipt.verifiedAt), 'dd MMM yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Download className="h-3.5 w-3.5" />}
                          onClick={() => handleDownload(receipt)}
                        >
                          PDF
                        </Button>
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
    </div>
  )
}
