'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { CheckCircle, Clock, CreditCard, DollarSign, FileText, ArrowRight } from 'lucide-react'
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

const PAYMENT_STATUS_STYLE: Record<string, string> = {
  VERIFIED: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  REJECTED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-slate-100 text-slate-600',
}

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
    queryFn: () =>
      applicationsApi.getApplications({ status: ApplicationStatus.PAYMENT_PENDING, limit: 50 }),
  })

  const isLoading = invoicesLoading || paymentsLoading || applicationsLoading

  const metrics = useMemo(() => {
    const pendingVerification = payments.filter((p) => p.status === 'PENDING').length
    const verifiedPayments = payments.filter((p) => p.status === 'VERIFIED')
    const totalRevenue = verifiedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    const invoicedApplicationIds = new Set(invoices.map((inv) => inv.applicationId))
    const awaitingInvoiceCount = (awaitingInvoices?.data ?? []).filter(
      (app) => !invoicedApplicationIds.has(app.id),
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Track invoicing, payment verification, and revenue for your tenant.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/finance/invoices"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileText className="h-3.5 w-3.5" />
            Invoices
          </Link>
          <Link
            href="/finance/payments"
            className="inline-flex items-center gap-1.5 rounded-lg bg-rnec-teal px-3 py-1.5 text-xs font-medium text-white hover:bg-rnec-teal/90"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Payments
          </Link>
        </div>
      </div>

      {isLoading ? (
        <Loader centered label="Loading dashboard..." />
      ) : (
        <>
          {/* Stats */}
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
              label="Total Revenue"
              value={`KES ${metrics.totalRevenue.toLocaleString()}`}
              icon={<DollarSign className="h-5 w-5 text-rnec-navy" />}
              iconBg="bg-slate-100"
            />
          </div>

          {/* Revenue summary strip */}
          {metrics.totalRevenue > 0 && (
            <Card shadow="sm">
              <CardBody>
                <div className="grid grid-cols-3 divide-x divide-slate-100">
                  <div className="px-4 text-center first:pl-0 last:pr-0">
                    <p className="text-xs text-slate-500">Total Invoiced</p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900">{invoices.length}</p>
                  </div>
                  <div className="px-4 text-center">
                    <p className="text-xs text-slate-500">Verified Revenue</p>
                    <p className="mt-0.5 text-lg font-bold text-emerald-700">
                      KES {metrics.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="px-4 text-center last:pr-0">
                    <p className="text-xs text-slate-500">Collection Rate</p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900">
                      {invoices.length > 0
                        ? Math.round((metrics.verifiedPayments / invoices.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent payments */}
            <Card shadow="sm" className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">Recent Payments</h2>
                  <Link
                    href="/finance/payments"
                    className="text-xs font-medium text-rnec-teal hover:text-rnec-navy flex items-center gap-1"
                  >
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                {!recentPayments.length ? (
                  <EmptyState title="No recent payments" description="Payments will appear here once applications are invoiced." />
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
                            <span className="text-sm font-medium text-slate-900 line-clamp-1">
                              {payment.invoice?.application?.title || 'Application payment'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-slate-500">
                              {payment.referenceNumber || '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold">
                              {payment.invoice?.currency || 'KES'}{' '}
                              {Number(payment.amount).toLocaleString()}
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
                                PAYMENT_STATUS_STYLE[payment.status] ?? 'bg-slate-100 text-slate-600',
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

            {/* Quick actions */}
            <div className="space-y-4">
              <Card shadow="sm">
                <CardHeader>
                  <h2 className="text-base font-semibold text-slate-900">Actions Needed</h2>
                </CardHeader>
                <CardBody className="space-y-3">
                  {metrics.awaitingInvoiceCount > 0 ? (
                    <Link href="/finance/invoices">
                      <div className="flex items-center gap-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-3 hover:bg-amber-100 transition-colors cursor-pointer">
                        <FileText className="h-5 w-5 text-amber-600 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800">
                            {metrics.awaitingInvoiceCount} to invoice
                          </p>
                          <p className="text-xs text-amber-600">Applications awaiting invoice</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-2">No pending invoices</p>
                  )}
                  {metrics.pendingVerification > 0 ? (
                    <Link href="/finance/payments">
                      <div className="flex items-center gap-3 rounded-lg bg-purple-50 border border-purple-100 px-3 py-3 hover:bg-purple-100 transition-colors cursor-pointer">
                        <CreditCard className="h-5 w-5 text-purple-600 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-purple-800">
                            {metrics.pendingVerification} to verify
                          </p>
                          <p className="text-xs text-purple-600">Payments awaiting verification</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-2">No pending verifications</p>
                  )}
                </CardBody>
              </Card>

              <Card shadow="sm">
                <CardHeader>
                  <h2 className="text-base font-semibold text-slate-900">Navigate</h2>
                </CardHeader>
                <CardBody className="space-y-2">
                  {[
                    { href: '/finance/invoices', label: 'Invoices', icon: FileText },
                    { href: '/finance/payments', label: 'Payments', icon: CreditCard },
                    { href: '/finance/receipts', label: 'Receipts', icon: CheckCircle },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-slate-400" />
                        {item.label}
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    </Link>
                  ))}
                </CardBody>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
