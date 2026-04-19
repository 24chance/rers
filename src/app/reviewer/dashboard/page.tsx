'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ClipboardList, CheckCircle, Clock } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { dashboardsApi } from '@/lib/api/dashboards.api'
import { useAuthStore } from '@/store/auth.store'
import { UserRole } from '@/types'
import { format } from 'date-fns'
import type { ReviewerDashboard } from '@/lib/api/dashboards.api'
import { clsx } from 'clsx'

export default function ReviewerDashboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'reviewer'],
    queryFn: () => dashboardsApi.getDashboard(UserRole.REVIEWER),
  })

  const dashboard = data as ReviewerDashboard | undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, Dr. {user?.lastName}!
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Here are your current review assignments.</p>
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
                <EmptyState title="No assignments" description="You have no review assignments yet." />
              ) : (
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeader>Application</TableHeader>
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
                          <span className="text-xs text-slate-500">
                            {assignment.deadline
                              ? format(new Date(assignment.deadline), 'dd MMM yyyy')
                              : 'No deadline'}
                          </span>
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
