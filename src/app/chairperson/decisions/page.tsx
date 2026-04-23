'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Gavel } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { applicationsApi } from '@/lib/api/applications.api'
import { ApplicationStatus } from '@/types'

const statusOptions = [
  { value: '', label: 'All statuses' },
  ...Object.values(ApplicationStatus).map((status) => ({
    value: status,
    label: status.replace(/_/g, ' '),
  })),
]

export default function ChairpersonDecisionsPage() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const queryParams = useMemo(
    () => ({
      limit: 50,
      status: status || undefined,
      search: search.trim() || undefined,
    }),
    [search, status],
  )

  const { data, isLoading, isError } = useQuery({
    queryKey: ['chairperson-applications', queryParams],
    queryFn: () => applicationsApi.getApplications(queryParams),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Review all applications in your tenant and open any record to inspect reviewer comments before deciding.
        </p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Tenant Application Register</h2>
              {data && (
                <p className="mt-0.5 text-xs text-slate-400">
                  {data.meta.total} application(s) found
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_280px]">
              <Select
                label="Status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                options={statusOptions}
              />
              <Input
                label="Search"
                placeholder="Search by title"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading applications..." />
          ) : isError ? (
            <EmptyState title="Failed to load" description="Please refresh and try again." />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<Gavel className="h-8 w-8 text-slate-400" />}
              title="No applications found"
              description="Try adjusting the current search or status filter."
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
                {data.data.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold">
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
                      <span className="text-xs text-slate-500">
                        {application.submittedAt
                          ? new Date(application.submittedAt).toLocaleDateString()
                          : '—'}
                      </span>
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
