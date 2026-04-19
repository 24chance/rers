'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { Pagination } from '@/components/ui/pagination'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { applicationsApi } from '@/lib/api/applications.api'
import { ApplicationStatus, ApplicationType } from '@/types'
import { format } from 'date-fns'

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

export default function RnecApplicationsPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    clearTimeout((window as unknown as { _st?: ReturnType<typeof setTimeout> })._st)
    ;(window as unknown as { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(() => {
      setDebouncedSearch(e.target.value)
      setPage(1)
    }, 400)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['rnec-all-applications', { search: debouncedSearch, status, type, page }],
    queryFn: () =>
      applicationsApi.getApplications({
        search: debouncedSearch || undefined,
        status: status as ApplicationStatus || undefined,
        type: type as ApplicationType || undefined,
        page,
        limit: 20,
      }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Applications</h1>
        <p className="text-slate-500 text-sm mt-0.5">National view of all research ethics applications across institutions</p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by title or reference..."
                value={search}
                onChange={handleSearch}
                leftElement={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex gap-2">
              <Select
                options={statusOptions}
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1) }}
                className="min-w-[160px]"
              />
              <Select
                options={typeOptions}
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1) }}
                className="min-w-[130px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading applications..." />
          ) : !data?.data.length ? (
            <EmptyState title="No applications found" description="Try adjusting your filters." />
          ) : (
            <>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Ref No.</TableHeader>
                    <TableHeader>Title</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Institution</TableHeader>
                    <TableHeader>Submitted</TableHeader>
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
                        <span className="font-mono text-xs text-slate-500">{app.tenantId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">
                          {app.submittedAt ? format(new Date(app.submittedAt), 'dd MMM yyyy') : '—'}
                        </span>
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
