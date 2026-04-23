'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { CheckCircle, Clock, Eye, Gavel } from 'lucide-react'
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chairperson Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Welcome, {user?.firstName}. Review every application in your tenant and record final decisions when ready.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Tenant Applications"
          value={tenantApplications?.meta?.total ?? 0}
          icon={<Eye className="h-5 w-5 text-rnec-teal" />}
          iconBg="bg-rnec-teal/10"
        />
        <MetricCard
          label="Awaiting Decision"
          value={pendingDecisions?.meta?.total ?? 0}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <MetricCard
          label="Approved"
          value={approvedData?.meta?.total ?? 0}
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
      </div>

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
                        {application.referenceNumber || application.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-1 text-sm font-medium text-slate-900">
                        {application.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600">
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
