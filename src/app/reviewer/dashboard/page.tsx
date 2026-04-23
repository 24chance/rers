'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ClipboardList, CheckCircle, Clock, AlertCircle, CalendarClock } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { dashboardsApi } from '@/lib/api/dashboards.api'
import { useAuthStore } from '@/store/auth.store'
import { UserRole } from '@/types'
import { format, isPast, isWithinInterval, addDays } from 'date-fns'
import type { ReviewerDashboard } from '@/lib/api/dashboards.api'
import { clsx } from 'clsx'

function DeadlineBadge({ deadline }: { deadline?: string }) {
  if (!deadline) return <span className="text-xs text-slate-400">No deadline</span>

  const date = new Date(deadline)
  const overdue = isPast(date)
  const dueSoon = !overdue && isWithinInterval(date, { start: new Date(), end: addDays(new Date(), 3) })

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs font-medium',
        overdue ? 'text-red-600' : dueSoon ? 'text-amber-600' : 'text-slate-500',
      )}
    >
      {overdue && <AlertCircle className="h-3 w-3" />}
      {dueSoon && <CalendarClock className="h-3 w-3" />}
      {format(date, 'dd MMM yyyy')}
      {overdue && ' (overdue)'}
      {dueSoon && ' (soon)'}
    </span>
  )
}

export default function ReviewerDashboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'reviewer'],
    queryFn: () => dashboardsApi.getDashboard(UserRole.REVIEWER),
  })

  const dashboard = data as ReviewerDashboard | undefined

  const completionRate =
    dashboard && dashboard.assignedReviews > 0
      ? Math.round((dashboard.completedReviews / dashboard.assignedReviews) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, Dr. {user?.lastName}!
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Here are your current review assignments.</p>
        </div>
        <Link href="/reviewer/assignments">
          <Button variant="primary" leftIcon={<ClipboardList className="h-4 w-4" />}>
            My Assignments
          </Button>
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
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              label="Assigned"
              value={dashboard?.assignedReviews ?? 0}
              icon={<ClipboardList className="h-5 w-5 text-rnec-teal" />}
              iconBg="bg-rnec-teal/10"
            />
            <MetricCard
              label="Completed"
              value={dashboard?.completedReviews ?? 0}
              icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
            />
            <MetricCard
              label="Pending"
              value={dashboard?.pendingReviews ?? 0}
              icon={<Clock className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-50"
            />
          </div>

          {/* Completion progress */}
          {(dashboard?.assignedReviews ?? 0) > 0 && (
            <Card shadow="sm">
              <CardBody>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Review Completion</p>
                    <p className="text-xs text-slate-500">
                      {dashboard?.completedReviews} of {dashboard?.assignedReviews} assignments completed
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-rnec-teal">{completionRate}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rnec-teal transition-all duration-700"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </CardBody>
            </Card>
          )}

          {/* Assignments table */}
          <Card shadow="sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">My Assignments</h2>
                <Link href="/reviewer/assignments" className="text-xs text-rnec-teal hover:text-rnec-navy font-medium">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {!dashboard?.recentAssignments?.length ? (
                <EmptyState
                  title="No assignments yet"
                  description="You have no active review assignments. New ones will appear here."
                />
              ) : (
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeader>Application</TableHeader>
                      <TableHeader>Ref No.</TableHeader>
                      <TableHeader>Deadline</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader></TableHeader>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {dashboard.recentAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <span className="text-sm font-medium text-slate-900 line-clamp-1">
                            {assignment.applicationTitle}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-slate-500">
                            {assignment.referenceNumber || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DeadlineBadge deadline={assignment.deadline} />
                        </TableCell>
                        <TableCell>
                          <span
                            className={clsx(
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                              assignment.isComplete
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700',
                            )}
                          >
                            {assignment.isComplete ? 'Completed' : 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/reviewer/assignments/${assignment.id}`}
                            className="text-xs text-rnec-teal hover:text-rnec-navy font-medium"
                          >
                            {assignment.isComplete ? 'View' : 'Review'}
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
