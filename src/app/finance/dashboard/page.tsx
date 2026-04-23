'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { CheckCircle, Clock, CreditCard, DollarSign } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { applicationsApi } from '@/lib/api/applications.api'
import { invoicesApi } from '@/lib/api/invoices.api'
import { paymentsApi } from '@/lib/api/payments.api'
import { ApplicationStatus } from '@/types'
import { format } from 'date-fns'
import { clsx } from 'clsx'

export default function FinanceDashboardPage() {
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['finance-dashboard-invoices'],
    queryFn: () => invoicesApi.getInvoices(),
  })

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['finance-dashboard-payments'],
    queryFn: () => paymentsApi.getPayments(),
  })

  const { data: awaitingInvoices, isLoading: applicationsLoading } = useQuery({
    queryKey: ['finance-dashboard-awaiting-invoices'],
    queryFn: () => applicationsApi.getApplications({ status: ApplicationStatus.PAYMENT_PENDING, limit: 50 }),
  })

  const isLoading = invoicesLoading || paymentsLoading || applicationsLoading

  const metrics = useMemo(() => {
    const pendingVerification = payments.filter((payment) => payment.status === 'PENDING').length
    const verifiedPayments = payments.filter((payment) => payment.status === 'VERIFIED')
    const totalRevenue = verifiedPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    )
    const invoicedApplicationIds = new Set(invoices.map((invoice) => invoice.applicationId))
    const awaitingInvoiceCount = (awaitingInvoices?.data ?? []).filter(
      (application) => !invoicedApplicationIds.has(application.id),
    ).length

    return {
      totalInvoices: invoices.length,
      pendingVerification,
      verifiedPayments: verifiedPayments.length,
      totalRevenue,
      awaitingInvoiceCount,
    }
  }, [awaitingInvoices?.data, invoices, payments])

  const recentPayments = payments.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Finance Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Track invoicing, payment verification, and receipt generation for your tenant.
        </p>
      </div>

      {isLoading ? (
        <Loader centered label="Loading dashboard..." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              label="Awaiting Invoice"
              value={metrics.awaitingInvoiceCount}
              icon={<CreditCard className="h-5 w-5 text-rnec-teal" />}
              iconBg="bg-rnec-teal/10"
            />
            <MetricCard
              label="Pending Verification"
              value={metrics.pendingVerification}
              icon={<Clock className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-50"
            />
            <MetricCard
              label="Verified Payments"
              value={metrics.verifiedPayments}
              icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
            />
            <MetricCard
              label="Revenue"
              value={metrics.totalRevenue.toLocaleString()}
              icon={<DollarSign className="h-5 w-5 text-rnec-navy" />}
              iconBg="bg-slate-100"
            />
          </div>

          <Card shadow="sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Recent Payments</h2>
                <Link href="/finance/payments" className="text-xs font-medium text-rnec-teal hover:text-rnec-navy">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {!recentPayments.length ? (
                <EmptyState title="No recent payments" />
              ) : (
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeader>Application</TableHeader>
                      <TableHeader>Reference</TableHeader>
                      <TableHeader>Amount</TableHeader>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Status</TableHeader>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <span className="text-sm font-medium text-slate-900">
                            {payment.invoice?.application?.title || 'Application payment'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-slate-600">
                            {payment.referenceNumber || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {payment.invoice?.currency || 'KES'} {Number(payment.amount).toLocaleString()}
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
