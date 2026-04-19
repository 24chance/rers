'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { api } from '@/lib/api/client'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import type { Invoice, PaginatedResponse } from '@/types'

async function getAllInvoices(page: number): Promise<PaginatedResponse<Invoice>> {
  const res = await api.get<PaginatedResponse<Invoice>>('/invoices', { params: { page, limit: 20 } })
  return res.data
}

export default function FinanceInvoicesPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['finance-invoices', page],
    queryFn: () => getAllInvoices(page),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
        <p className="text-slate-500 text-sm mt-0.5">All generated application invoices</p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">All Invoices</h2>
            {data && (
              <span className="text-sm text-slate-400">{data.meta.total} total</span>
            )}
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading invoices..." />
          ) : isError ? (
            <EmptyState title="Failed to load" description="Please refresh." />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<FileText className="h-8 w-8 text-slate-400" />}
              title="No invoices yet"
              description="Invoices are generated when applications pass screening."
            />
          ) : (
            <>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Invoice ID</TableHeader>
                    <TableHeader>Application</TableHeader>
                    <TableHeader>Amount</TableHeader>
                    <TableHeader>Currency</TableHeader>
                    <TableHeader>Due Date</TableHeader>
                    <TableHeader>Status</TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {data.data.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <span className="font-mono text-xs">{invoice.id.slice(0, 12)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-slate-600">
                          {invoice.applicationId.slice(0, 12)}...
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold">
                          {Number(invoice.amount).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-600">{invoice.currency}</span>
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
                                : invoice.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-700'
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
