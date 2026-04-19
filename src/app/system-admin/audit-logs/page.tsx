'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, FileSearch, Download } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/api/client'
import { format } from 'date-fns'
import { clsx } from 'clsx'

interface AuditLog {
  id: string
  userId: string
  userEmail: string
  userRole: string
  action: string
  resource: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

interface PaginatedAuditLogs {
  data: AuditLog[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

async function getAuditLogs(params: {
  page: number
  search?: string
  action?: string
  resource?: string
  dateFrom?: string
  dateTo?: string
}): Promise<PaginatedAuditLogs> {
  const res = await api.get<PaginatedAuditLogs>('/audit-logs', { params: { ...params, limit: 25 } })
  return res.data
}

async function exportAuditLogs(params: {
  search?: string
  action?: string
  resource?: string
  dateFrom?: string
  dateTo?: string
}): Promise<Blob> {
  const res = await api.get<Blob>('/audit-logs/export', {
    params,
    responseType: 'blob',
  })
  return res.data
}

const actionOptions = [
  { value: '', label: 'All actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'READ', label: 'Read' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'SUBMIT', label: 'Submit' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REJECT', label: 'Reject' },
]

const resourceOptions = [
  { value: '', label: 'All resources' },
  { value: 'APPLICATION', label: 'Application' },
  { value: 'USER', label: 'User' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'DECISION', label: 'Decision' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'TENANT', label: 'Tenant' },
  { value: 'SETTINGS', label: 'Settings' },
]

const actionColors: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-slate-100 text-slate-600',
  LOGOUT: 'bg-slate-100 text-slate-500',
  SUBMIT: 'bg-purple-100 text-purple-700',
  APPROVE: 'bg-emerald-100 text-emerald-700',
  REJECT: 'bg-red-100 text-red-700',
  READ: 'bg-slate-100 text-slate-500',
}

export default function SystemAuditLogsPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [action, setAction] = useState('')
  const [resource, setResource] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    clearTimeout((window as unknown as { _alt?: ReturnType<typeof setTimeout> })._alt)
    ;(window as unknown as { _alt?: ReturnType<typeof setTimeout> })._alt = setTimeout(() => {
      setDebouncedSearch(e.target.value)
      setPage(1)
    }, 400)
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit-logs', { search: debouncedSearch, action, resource, dateFrom, dateTo, page }],
    queryFn: () =>
      getAuditLogs({
        page,
        search: debouncedSearch || undefined,
        action: action || undefined,
        resource: resource || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
  })

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await exportAuditLogs({
        search: debouncedSearch || undefined,
        action: action || undefined,
        resource: resource || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to export audit logs.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-500 text-sm mt-0.5">Complete platform activity and security event history</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<Download className="h-4 w-4" />}
          loading={isExporting}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search by user, action, or resource ID..."
                  value={search}
                  onChange={handleSearch}
                  leftElement={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="flex gap-2">
                <Select
                  options={actionOptions}
                  value={action}
                  onChange={(e) => { setAction(e.target.value); setPage(1) }}
                  className="min-w-[140px]"
                />
                <Select
                  options={resourceOptions}
                  value={resource}
                  onChange={(e) => { setResource(e.target.value); setPage(1) }}
                  className="min-w-[140px]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Input
                type="date"
                label=""
                placeholder="From date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                className="w-auto"
              />
              <Input
                type="date"
                label=""
                placeholder="To date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                className="w-auto"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading audit logs..." />
          ) : isError ? (
            <EmptyState title="Failed to load" description="Please refresh." />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<FileSearch className="h-8 w-8 text-slate-400" />}
              title="No audit logs found"
              description="Try adjusting your filters or date range."
            />
          ) : (
            <>
              <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                <span className="text-xs text-slate-500">{data.meta.total} event(s) found</span>
              </div>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Timestamp</TableHeader>
                    <TableHeader>User</TableHeader>
                    <TableHeader>Role</TableHeader>
                    <TableHeader>Action</TableHeader>
                    <TableHeader>Resource</TableHeader>
                    <TableHeader>Resource ID</TableHeader>
                    <TableHeader>IP Address</TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {data.data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm:ss')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-700">{log.userEmail}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">{log.userRole.replace(/_/g, ' ')}</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={clsx(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            actionColors[log.action] ?? 'bg-slate-100 text-slate-600',
                          )}
                        >
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-700">{log.resource}</span>
                      </TableCell>
                      <TableCell>
                        {log.resourceId ? (
                          <span className="font-mono text-xs text-slate-500">{log.resourceId.slice(0, 12)}...</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-slate-500">{log.ipAddress ?? '—'}</span>
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
