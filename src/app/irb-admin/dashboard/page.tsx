'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { FileText, Clock, CheckCircle, XCircle, CreditCard, Eye } from 'lucide-react'
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

export default function IrbAdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'irb-admin'],
    queryFn: () => dashboardsApi.getDashboard(UserRole.IRB_ADMIN),
  })

  const dashboard = data as AdminDashboard | undefined

  const countByStatus = (status: string) =>
    dashboard?.applicationsByStatus?.find((s) => s.status === status)?.count ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">IRB Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Overview of applications and review activity</p>
      </div>

      {isLoading ? (
        <Loader centered label="Loading dashboard..." />
      ) : isError ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4 text-sm text-red-700">
          Failed to load dashboard.
        </div>
      ) : (
        <>
          {/* Stats */}
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

          {/* Recent submissions */}
          <Card shadow="sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Recent Submissions</h2>
                <Link href="/irb-admin/applications" className="text-xs text-rnec-teal hover:text-rnec-navy font-medium">
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
                      <TableHeader>Action</TableHeader>
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
                          <span className="text-sm text-slate-700">{activity.action}</span>
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
        </>
      )}
    </div>
  )
}
