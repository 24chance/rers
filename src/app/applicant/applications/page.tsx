'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Pagination } from '@/components/ui/pagination'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { applicationsApi } from '@/lib/api/applications.api'
import { ApplicationStatus, ApplicationType } from '@/types'
import { format } from 'date-fns'
import { FileText } from 'lucide-react'

const statusOptions = [
  { value: '', label: 'All statuses' },
  ...Object.values(ApplicationStatus).map((s) => ({ value: s, label: s.replace(/_/g, ' ') })),
]

const typeOptions = [
  { value: '', label: 'All types' },
  { value: ApplicationType.FULL_BOARD, label: 'Full Board' },
  { value: ApplicationType.EXPEDITED, label: 'Expedited' },
  { value: ApplicationType.EXEMPT, label: 'Exempt' },
]

export default function ApplicationsListPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    clearTimeout((window as unknown as { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer)
    ;(window as unknown as { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer = setTimeout(() => {
      setDebouncedSearch(e.target.value)
      setPage(1)
    }, 400)
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['applications', { search: debouncedSearch, status, type, page }],
    queryFn: () =>
      applicationsApi.getApplications({
        search: debouncedSearch || undefined,
        status: status || undefined,
        type: type || undefined,
        page,
        limit: 15,
      }),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your research ethics applications</p>
        </div>
        <Link href="/applicant/applications/new">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            New Application
          </Button>
        </Link>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by title or reference..."
                value={search}
                onChange={handleSearchChange}
                leftElement={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex gap-2">
              <Select
                options={statusOptions}
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1) }}
                className="min-w-[140px]"
              />
              <Select
                options={typeOptions}
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1) }}
                className="min-w-[120px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading applications..." />
          ) : isError ? (
            <EmptyState title="Failed to load" description="Please refresh the page." />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<FileText className="h-8 w-8 text-slate-400" />}
              title="No applications found"
              description={
                debouncedSearch || status || type
                  ? 'Try adjusting your filters.'
                  : 'Submit your first research ethics application.'
              }
              action={
                !debouncedSearch && !status && !type ? (
                  <Link href="/applicant/applications/new">
                    <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                      New Application
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <>
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
                        <span className="font-mono text-xs font-semibold text-slate-900">
                          {app.referenceNumber}
                        </span>
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
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/applicant/applications/${app.id}`}
                            className="text-xs text-rnec-teal hover:text-rnec-navy font-medium"
                          >
                            View
                          </Link>
                          {app.status === ApplicationStatus.DRAFT && (
                            <Link
                              href={`/applicant/applications/${app.id}/edit`}
                              className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                            >
                              Edit
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.meta && (
                <div className="px-4">
                  <Pagination meta={data.meta} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
