'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { CheckCircle, Clock, Eye, Gavel, BarChart3 } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { applicationsApi } from '@/lib/api/applications.api'
import { ApplicationStatus } from '@/types'
import { useAuthStore } from '@/store/auth.store'

export default function ChairpersonDashboardPage() {
  const user = useAuthStore((state) => state.user)

  const { data: tenantApplications, isLoading } = useQuery({
    queryKey: ['chairperson-dashboard-applications'],
    queryFn: () => applicationsApi.getApplications({ limit: 8 }),
  })

  const { data: pendingDecisions } = useQuery({
    queryKey: ['chairperson-pending-decisions'],
    queryFn: () =>
      applicationsApi.getApplications({
        status: ApplicationStatus.DECISION_PENDING,
        limit: 1,
      }),
  })

  const { data: approvedData } = useQuery({
    queryKey: ['chairperson-approved-count'],
    queryFn: () =>
      applicationsApi.getApplications({
        status: ApplicationStatus.APPROVED,
        limit: 1,
      }),
  })

  const { data: underReviewData } = useQuery({
    queryKey: ['chairperson-under-review-count'],
    queryFn: () =>
      applicationsApi.getApplications({
        status: ApplicationStatus.UNDER_REVIEW,
        limit: 1,
      }),
  })

  const totalApps = tenantApplications?.meta?.total ?? 0
  const pendingCount = pendingDecisions?.meta?.total ?? 0
  const approvedCount = approvedData?.meta?.total ?? 0

  const decisionRate = totalApps > 0 ? Math.round((approvedCount / totalApps) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chairperson Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Welcome, {user?.firstName}. Review applications and record final decisions.
          </p>
        </div>
        <Link href="/chairperson/decisions">
          <Button variant="primary" leftIcon={<Gavel className="h-4 w-4" />}>
            Decisions
          </Button>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Tenant Applications"
          value={totalApps}
          icon={<Eye className="h-5 w-5 text-rnec-teal" />}
          iconBg="bg-rnec-teal/10"
        />
        <MetricCard
          label="Awaiting Decision"
          value={pendingCount}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <MetricCard
          label="Under Review"
          value={underReviewData?.meta?.total ?? 0}
          icon={<BarChart3 className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-50"
        />
        <MetricCard
          label="Approved"
          value={approvedCount}
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
      </div>

      {/* Approval rate */}
      {totalApps > 0 && (
        <Card shadow="sm">
          <CardBody>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">Approval Rate</p>
                <p className="text-xs text-slate-500">
                  {approvedCount} approved out of {totalApps} total applications
                </p>
              </div>
              <span className="text-2xl font-bold text-emerald-600">{decisionRate}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${decisionRate}%` }}
              />
            </div>
            {pendingCount > 0 && (
              <p className="mt-2 text-xs text-amber-700 font-medium">
                {pendingCount} application{pendingCount > 1 ? 's' : ''} await{pendingCount === 1 ? 's' : ''} your decision
              </p>
            )}
          </CardBody>
        </Card>
      )}

      {/* Applications table */}
      <Card shadow="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Applications in Your Tenant</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Under review now: {underReviewData?.meta?.total ?? 0}
              </p>
            </div>
            <Link
              href="/chairperson/decisions"
              className="text-xs font-medium text-rnec-teal hover:text-rnec-navy"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading applications..." />
          ) : !tenantApplications?.data?.length ? (
            <EmptyState
              icon={<Gavel className="h-8 w-8 text-slate-300" />}
              title="No applications yet"
              description="Applications from your tenant will appear here."
            />
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Ref No.</TableHeader>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {tenantApplications.data.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <span className="font-mono text-xs">
                        {application.referenceNumber || application.id.slice(0, 8)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-1 text-sm font-medium text-slate-900">
                        {application.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
                        {application.type.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={application.status} />
                    </TableCell>
                    <TableCell>
                      <Link href={`/chairperson/decisions/${application.id}`}>
                        <Button
                          variant={
                            application.status === ApplicationStatus.DECISION_PENDING
                              ? 'primary'
                              : 'outline'
                          }
                          size="sm"
                          leftIcon={<Gavel className="h-3.5 w-3.5" />}
                        >
                          {application.status === ApplicationStatus.DECISION_PENDING
                            ? 'Decide'
                            : 'Open'}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
