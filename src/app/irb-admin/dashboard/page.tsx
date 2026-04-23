'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { FileText, Clock, CheckCircle, XCircle, CreditCard, Eye, Users, ArrowRight } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { dashboardsApi } from '@/lib/api/dashboards.api'
import { UserRole, ApplicationStatus } from '@/types'
import { format } from 'date-fns'
import type { AdminDashboard } from '@/lib/api/dashboards.api'

const STATUS_LABEL: Record<string, string> = {
  SCREENING: 'Screening',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  CONDITIONALLY_APPROVED: 'Cond. Approved',
  REJECTED: 'Rejected',
  PAYMENT_PENDING: 'Payment Pending',
  MONITORING_ACTIVE: 'Monitoring',
  SUBMITTED: 'Submitted',
}

export default function IrbAdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'irb-admin'],
    queryFn: () => dashboardsApi.getDashboard(UserRole.IRB_ADMIN),
  })

  const dashboard = data as AdminDashboard | undefined

  const countByStatus = (status: string) =>
    dashboard?.applicationsByStatus?.find((s) => s.status === status)?.count ?? 0

  const pipeline = [
    { status: 'SCREENING', count: countByStatus('SCREENING'), color: 'bg-indigo-500' },
    { status: 'PAYMENT_PENDING', count: countByStatus('PAYMENT_PENDING'), color: 'bg-amber-400' },
    { status: 'UNDER_REVIEW', count: dashboard?.underReview ?? 0, color: 'bg-purple-500' },
    { status: 'APPROVED', count: countByStatus('APPROVED'), color: 'bg-emerald-500' },
    { status: 'REJECTED', count: countByStatus('REJECTED'), color: 'bg-red-500' },
  ]
  const pipelineTotal = pipeline.reduce((s, p) => s + p.count, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">IRB Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Overview of applications and review activity</p>
        </div>
        <Link
          href="/irb-admin/applications"
          className="inline-flex items-center gap-1.5 rounded-lg bg-rnec-teal px-3 py-1.5 text-xs font-medium text-white hover:bg-rnec-teal/90 transition-colors"
        >
          All Applications <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <Loader centered label="Loading dashboard..." />
      ) : isError ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4 text-sm text-red-700">
          Failed to load dashboard. Please refresh.
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <MetricCard
              label="Total"
              value={dashboard?.totalApplications ?? 0}
              icon={<FileText className="h-5 w-5 text-rnec-teal" />}
              iconBg="bg-rnec-teal/10"
            />
            <MetricCard
              label="Screening"
              value={countByStatus('SCREENING')}
              icon={<Eye className="h-5 w-5 text-indigo-600" />}
              iconBg="bg-indigo-50"
            />
            <MetricCard
              label="Under Review"
              value={dashboard?.underReview ?? 0}
              icon={<Clock className="h-5 w-5 text-purple-600" />}
              iconBg="bg-purple-50"
            />
            <MetricCard
              label="Approved"
              value={countByStatus('APPROVED')}
              icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
            />
            <MetricCard
              label="Rejected"
              value={countByStatus('REJECTED')}
              icon={<XCircle className="h-5 w-5 text-red-600" />}
              iconBg="bg-red-50"
            />
            <MetricCard
              label="Payment Pending"
              value={countByStatus('PAYMENT_PENDING')}
              icon={<CreditCard className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-50"
            />
          </div>

          {/* Pipeline visualisation */}
          {pipelineTotal > 0 && (
            <Card shadow="sm">
              <CardHeader>
                <h2 className="text-base font-semibold text-slate-900">Application Pipeline</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex h-3 w-full overflow-hidden rounded-full gap-0.5">
                  {pipeline.map((p) =>
                    p.count > 0 ? (
                      <div
                        key={p.status}
                        className={`${p.color} h-full transition-all`}
                        style={{ width: `${(p.count / pipelineTotal) * 100}%` }}
                        title={`${STATUS_LABEL[p.status] ?? p.status}: ${p.count}`}
                      />
                    ) : null,
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {pipeline.map((p) => (
                    <div key={p.status} className="flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${p.color}`} />
                      <span className="text-xs text-slate-600">
                        {STATUS_LABEL[p.status] ?? p.status}
                        <span className="ml-1 font-semibold text-slate-800">{p.count}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent activity */}
            <Card shadow="sm" className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">Recent Submissions</h2>
                  <Link
                    href="/irb-admin/applications"
                    className="text-xs font-medium text-rnec-teal hover:text-rnec-navy"
                  >
                    View all
                  </Link>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                {!dashboard?.recentActivity?.length ? (
                  <EmptyState title="No recent activity" />
                ) : (
                  <Table>
                    <TableHead>
                      <tr>
                        <TableHeader>Ref No.</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader>Actor</TableHeader>
                        <TableHeader>Date</TableHeader>
                        <TableHeader></TableHeader>
                      </tr>
                    </TableHead>
                    <TableBody>
                      {dashboard.recentActivity.map((activity) => (
                        <TableRow key={`${activity.applicationId}-${activity.createdAt}`}>
                          <TableCell>
                            <span className="font-mono text-xs">{activity.referenceNumber}</span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={activity.action as ApplicationStatus} />
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-600">{activity.actorName}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-slate-400">
                              {format(new Date(activity.createdAt), 'dd MMM yyyy')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/irb-admin/applications/${activity.applicationId}`}
                              className="text-xs text-rnec-teal hover:text-rnec-navy font-medium"
                            >
                              View
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardBody>
            </Card>

            {/* Reviewer workload */}
            <Card shadow="sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <h2 className="text-base font-semibold text-slate-900">Reviewer Workload</h2>
                </div>
              </CardHeader>
              <CardBody>
                {!dashboard?.reviewerWorkload?.length ? (
                  <p className="text-sm text-slate-400 text-center py-4">No active reviewers</p>
                ) : (
                  <div className="space-y-3">
                    {(dashboard.reviewerWorkload as Array<{ reviewerId: string; name: string; assignedCount: number }>)
                      .slice(0, 6)
                      .map((reviewer) => (
                        <div key={reviewer.reviewerId} className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rnec-navy/10 text-rnec-navy text-xs font-bold">
                            {reviewer.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{reviewer.name}</p>
                            <div className="mt-0.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-rnec-teal"
                                style={{
                                  width: `${Math.min(100, (reviewer.assignedCount / 10) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-slate-700 tabular-nums">
                            {reviewer.assignedCount}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
