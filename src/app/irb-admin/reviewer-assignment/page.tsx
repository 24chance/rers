'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { UserCheck } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { applicationsApi } from '@/lib/api/applications.api'
import { ApplicationStatus } from '@/types'
import { format } from 'date-fns'

export default function ReviewerAssignmentPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['applications-needing-assignment'],
    queryFn: () =>
      applicationsApi.getApplications({
        status: ApplicationStatus.PAYMENT_VERIFIED,
        limit: 50,
      }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reviewer Assignment</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Applications with verified payment that need reviewers assigned
        </p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Awaiting Reviewer Assignment</h2>
            {data && (
              <span className="text-sm text-slate-400">{data.meta.total} application(s)</span>
            )}
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading..." />
          ) : isError ? (
            <EmptyState title="Failed to load" description="Please refresh." />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<UserCheck className="h-8 w-8 text-slate-400" />}
              title="No applications pending assignment"
              description="All payment-verified applications have been assigned reviewers."
            />
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Ref No.</TableHeader>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Submitted</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {data.data.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold">{app.referenceNumber}</span>
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
                      <span className="text-xs text-slate-500">
                        {app.submittedAt ? format(new Date(app.submittedAt), 'dd MMM yyyy') : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/irb-admin/applications/${app.id}?tab=reviewers`}>
                        <Button variant="primary" size="sm" leftIcon={<UserCheck className="h-4 w-4" />}>
                          Assign Reviewer
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
