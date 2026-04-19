'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Gavel, Clock, CheckCircle } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { applicationsApi } from '@/lib/api/applications.api'
import { ApplicationStatus } from '@/types'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/auth.store'

export default function ChairpersonDashboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data: pendingDecisions, isLoading } = useQuery({
    queryKey: ['pending-decisions'],
    queryFn: () =>
      applicationsApi.getApplications({
        status: ApplicationStatus.DECISION_PENDING,
        limit: 10,
      }),
  })

  const { data: approvedData } = useQuery({
    queryKey: ['approved-count'],
    queryFn: () => applicationsApi.getApplications({ status: ApplicationStatus.APPROVED, limit: 1 }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Chairperson Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Welcome, {user?.firstName}. Review applications awaiting your decision.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="Awaiting Decision"
          value={pendingDecisions?.meta?.total ?? 0}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <MetricCard
          label="Approved This Month"
          value={approvedData?.meta?.total ?? 0}
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <MetricCard
          label="Total Decisions"
          value="—"
          icon={<Gavel className="h-5 w-5 text-rnec-teal" />}
          iconBg="bg-rnec-teal/10"
        />
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Applications Awaiting Decision</h2>
            <Link href="/chairperson/decisions" className="text-xs text-rnec-teal hover:text-rnec-navy font-medium">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered />
          ) : !pendingDecisions?.data?.length ? (
            <EmptyState
              icon={<Gavel className="h-8 w-8 text-slate-300" />}
              title="No pending decisions"
              description="All applications have been resolved."
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
                {pendingDecisions.data.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <span className="font-mono text-xs">{app.referenceNumber}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-slate-900 line-clamp-1">{app.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600">{app.type.replace(/_/g, ' ')}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell>
                      <Link href={`/chairperson/decisions?id=${app.id}`}>
                        <Button variant="primary" size="sm" leftIcon={<Gavel className="h-3.5 w-3.5" />}>
                          Decide
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
