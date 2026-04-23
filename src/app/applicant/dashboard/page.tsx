'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileText, CheckCircle, Clock, Award, Plus, AlertCircle, CreditCard } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { PendingActionsList } from '@/components/dashboard/pending-actions-list'
import type { PendingAction } from '@/components/dashboard/pending-actions-list'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { dashboardsApi } from '@/lib/api/dashboards.api'
import { useAuthStore } from '@/store/auth.store'
import { UserRole, ApplicationStatus } from '@/types'
import { format } from 'date-fns'
import type { ApplicantDashboard } from '@/lib/api/dashboards.api'

const WORKFLOW_STAGES = [
  { label: 'Draft', status: ApplicationStatus.DRAFT, color: 'bg-slate-400' },
  { label: 'Submitted', status: ApplicationStatus.SUBMITTED, color: 'bg-blue-400' },
  { label: 'Screening', status: ApplicationStatus.SCREENING, color: 'bg-indigo-400' },
  { label: 'Payment', status: ApplicationStatus.PAYMENT_PENDING, color: 'bg-amber-400' },
  { label: 'Review', status: ApplicationStatus.UNDER_REVIEW, color: 'bg-purple-400' },
  { label: 'Decision', status: ApplicationStatus.DECISION_PENDING, color: 'bg-orange-400' },
  { label: 'Approved', status: ApplicationStatus.APPROVED, color: 'bg-emerald-500' },
]

export default function ApplicantDashboardPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'applicant'],
    queryFn: () => dashboardsApi.getDashboard(UserRole.APPLICANT),
  })

  const dashboard = data as ApplicantDashboard | undefined

  const pendingActions: PendingAction[] = (dashboard?.recentApplications ?? [])
    .filter((a) => a.status === 'PAYMENT_PENDING' || a.status === 'QUERY_RAISED')
    .map((a) => {
      if (a.status === 'PAYMENT_PENDING') {
        return {
          id: a.id,
          title: `Payment required: ${a.title}`,
          description: 'Your application requires payment to proceed to review.',
          type: 'payment' as const,
          href: `/applicant/applications/${a.id}`,
          urgent: true,
        }
      }
      return {
        id: a.id,
        title: `Query raised: ${a.title}`,
        description: 'The IRB has raised a query on your application. Please respond.',
        type: 'query' as const,
        href: `/applicant/applications/${a.id}`,
        urgent: true,
      }
    })

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Here&apos;s an overview of your research applications.
          </p>
        </div>
        <Link href="/applicant/applications/new">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            New Application
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Loader centered label="Loading dashboard..." />
      ) : isError ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4 text-sm text-red-700">
          Failed to load dashboard data. Please refresh the page.
        </div>
      ) : (
        <>
          {/* Urgent alerts */}
          {pendingActions.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {pendingActions.length} action{pendingActions.length > 1 ? 's' : ''} required
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  You have pending actions that need your attention before your application can proceed.
                </p>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Applications"
              value={dashboard?.totalApplications ?? 0}
              icon={<FileText className="h-5 w-5 text-rnec-teal" />}
              iconBg="bg-rnec-teal/10"
              onClick={() => router.push('/applicant/applications')}
            />
            <MetricCard
              label="Drafts"
              value={dashboard?.draftApplications ?? 0}
              icon={<Clock className="h-5 w-5 text-slate-500" />}
              iconBg="bg-slate-100"
            />
            <MetricCard
              label="Under Review"
              value={dashboard?.underReviewApplications ?? 0}
              icon={<Clock className="h-5 w-5 text-purple-600" />}
              iconBg="bg-purple-50"
            />
            <MetricCard
              label="Approved"
              value={dashboard?.approvedApplications ?? 0}
              icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
            />
          </div>

          {/* Workflow stages visual */}
          {(dashboard?.totalApplications ?? 0) > 0 && (
            <Card shadow="sm">
              <CardHeader>
                <h2 className="text-base font-semibold text-slate-900">Submission Workflow</h2>
              </CardHeader>
              <CardBody>
                <div className="flex items-center gap-0">
                  {WORKFLOW_STAGES.map((stage, idx) => {
                    const isActive = dashboard?.recentApplications?.some(
                      (a) => a.status === stage.status,
                    )
                    return (
                      <div key={stage.status} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`h-2.5 w-full rounded-sm ${
                              isActive ? stage.color : 'bg-slate-100'
                            }`}
                          />
                          <span
                            className={`mt-1.5 text-[10px] font-medium text-center leading-tight ${
                              isActive ? 'text-slate-800' : 'text-slate-400'
                            }`}
                          >
                            {stage.label}
                          </span>
                        </div>
                        {idx < WORKFLOW_STAGES.length - 1 && (
                          <div className="w-px h-3 bg-slate-200 shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardBody>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent applications */}
            <Card shadow="sm" className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">My Recent Applications</h2>
                  <Link href="/applicant/applications" className="text-xs text-rnec-teal hover:text-rnec-navy font-medium transition-colors">
                    View all
                  </Link>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                {!dashboard?.recentApplications?.length ? (
                  <EmptyState
                    title="No applications yet"
                    description="Start your first research ethics application."
                    action={
                      <Link href="/applicant/applications/new">
                        <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                          New Application
                        </Button>
                      </Link>
                    }
                  />
                ) : (
                  <Table>
                    <TableHead>
                      <tr>
                        <TableHeader>Ref No.</TableHeader>
                        <TableHeader>Title</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader>Updated</TableHeader>
                        <TableHeader></TableHeader>
                      </tr>
                    </TableHead>
                    <TableBody>
                      {dashboard.recentApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <span className="font-mono text-xs">{app.referenceNumber ?? '—'}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-slate-900 line-clamp-1">{app.title}</span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={app.status as ApplicationStatus} />
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-slate-500">
                              {format(new Date(app.updatedAt), 'dd MMM yyyy')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/applicant/applications/${app.id}`}
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

            {/* Sidebar */}
            <div className="space-y-6">
              <Card shadow="sm">
                <CardHeader>
                  <h2 className="text-base font-semibold text-slate-900">Pending Actions</h2>
                </CardHeader>
                <CardBody>
                  <PendingActionsList actions={pendingActions} />
                </CardBody>
              </Card>

              <Card shadow="sm">
                <CardHeader>
                  <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
                </CardHeader>
                <CardBody className="space-y-2">
                  <Link href="/applicant/applications/new" className="block">
                    <Button variant="primary" className="w-full justify-start" leftIcon={<Plus className="h-4 w-4" />}>
                      New Application
                    </Button>
                  </Link>
                  <Link href="/applicant/applications" className="block">
                    <Button variant="outline" className="w-full justify-start" leftIcon={<FileText className="h-4 w-4" />}>
                      My Applications
                    </Button>
                  </Link>
                  <Link href="/applicant/certificates" className="block">
                    <Button variant="outline" className="w-full justify-start" leftIcon={<Award className="h-4 w-4" />}>
                      View Certificates
                    </Button>
                  </Link>
                  <Link href="/applicant/renewals" className="block">
                    <Button variant="outline" className="w-full justify-start" leftIcon={<CreditCard className="h-4 w-4" />}>
                      Renewals
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
