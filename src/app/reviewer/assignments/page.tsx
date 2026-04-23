'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { reviewsApi } from '@/lib/api/reviews.api'
import { format } from 'date-fns'
import { clsx } from 'clsx'

function getAssignmentStatus(
  assignment: Awaited<ReturnType<typeof reviewsApi.getAssignments>>[number],
) {
  if (assignment.conflictDeclared) {
    return {
      label: 'Conflict',
      className: 'bg-rose-100 text-rose-700',
    }
  }

  if (!assignment.isActive) {
    return {
      label: 'Inactive',
      className: 'bg-slate-200 text-slate-700',
    }
  }

  return {
    label: 'Assigned',
    className: 'bg-sky-100 text-sky-700',
  }
}

export default function ReviewerAssignmentsPage() {
  const { data: assignments, isLoading, isError } = useQuery({
    queryKey: ['reviewer-assignments'],
    queryFn: () => reviewsApi.getAssignments(),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Assignments</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Applications assigned to you for peer review
        </p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              All Assignments
              {assignments && (
                <span className="ml-2 text-sm font-normal text-slate-400">({assignments.length})</span>
              )}
            </h2>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading assignments..." />
          ) : isError ? (
            <EmptyState title="Failed to load" description="Please refresh the page." />
          ) : !assignments?.length ? (
            <EmptyState
              icon={<ClipboardList className="h-8 w-8 text-slate-400" />}
              title="No assignments yet"
              description="You have no review assignments at this time."
            />
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Ref No.</TableHeader>
                  <TableHeader>Application Title</TableHeader>
                  <TableHeader>Due Date</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {assignments.map((assignment) => {
                  const status = getAssignmentStatus(assignment)

                  return (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="block font-mono text-xs text-slate-600">
                            {assignment.application?.referenceNumber ?? assignment.applicationId}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {assignment.application?.type.replace(/_/g, ' ') ?? 'Research application'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="block text-sm font-medium text-slate-900">
                            {assignment.application?.title ?? `Application #${assignment.applicationId.slice(0, 8)}`}
                          </span>
                          <span className="block text-xs text-slate-400">
                            Status: {assignment.application?.status.replace(/_/g, ' ') ?? 'UNDER REVIEW'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">
                          {assignment.dueDate
                            ? format(new Date(assignment.dueDate), 'dd MMM yyyy')
                            : 'No due date'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={clsx(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                            status.className,
                          )}
                        >
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/reviewer/assignments/${assignment.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={assignment.conflictDeclared}
                          >
                            {assignment.conflictDeclared ? 'Unavailable' : 'Review'}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
