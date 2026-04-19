'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { CreditCard, CheckCircle, Clock, DollarSign } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { api } from '@/lib/api/client'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import type { Payment } from '@/lib/api/payments.api'

interface FinanceDashboard {
  totalInvoices: number
  verifiedPayments: number
  pendingVerification: number
  totalRevenue: number
  recentPayments: Payment[]
}

async function getFinanceDashboard(): Promise<FinanceDashboard> {
  const res = await api.get<FinanceDashboard>('/dashboards/finance')
  return res.data
}

export default function FinanceDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'finance'],
    queryFn: getFinanceDashboard,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Finance Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Overview of invoices and payment activity</p>
      </div>

      {isLoading ? (
        <Loader centered label="Loading..." />
      ) : isError ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4 text-sm text-red-700">
          Failed to load dashboard.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Invoices"
              value={data?.totalInvoices ?? 0}
              icon={<CreditCard className="h-5 w-5 text-rnec-teal" />}
              iconBg="bg-rnec-teal/10"
            />
            <MetricCard
              label="Verified Payments"
              value={data?.verifiedPayments ?? 0}
              icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
            />
            <MetricCard
              label="Pending Verification"
              value={data?.pendingVerification ?? 0}
              icon={<Clock className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-50"
            />
            <MetricCard
              label="Total Revenue (RWF)"
              value={data?.totalRevenue ? Number(data.totalRevenue).toLocaleString() : '0'}
              icon={<DollarSign className="h-5 w-5 text-rnec-navy" />}
              iconBg="bg-slate-100"
            />
          </div>

          <Card shadow="sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Recent Payments</h2>
                <Link href="/finance/payments" className="text-xs text-rnec-teal hover:text-rnec-navy font-medium">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {!data?.recentPayments?.length ? (
                <EmptyState title="No recent payments" />
              ) : (
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeader>Transaction Ref</TableHeader>
                      <TableHeader>Application</TableHeader>
                      <TableHeader>Amount</TableHeader>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Status</TableHeader>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {data.recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <span className="font-mono text-xs">{payment.transactionReference}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-600">{payment.applicationId.slice(0, 8)}...</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {payment.currency} {Number(payment.amount).toLocaleString()}
                          </span>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
