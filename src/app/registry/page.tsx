'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Search, BookOpen, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { registryApi } from '@/lib/api/registry.api'
import { format } from 'date-fns'

export default function RegistryPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // simple debounce inline
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    const timer = setTimeout(() => {
      setDebouncedSearch(e.target.value)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['registry', { search: debouncedSearch, page }],
    queryFn: () => registryApi.getRegistry({ search: debouncedSearch || undefined, page, limit: 15 }),
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-rnec-navy py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-7 w-7 text-rnec-gold" />
            <h1 className="text-3xl font-bold text-white">Approved Studies Registry</h1>
          </div>
          <p className="text-white/70 text-sm">
            Publicly accessible registry of all RNEC-approved research studies
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6 max-w-lg">
          <Input
            placeholder="Search by title or reference number..."
            value={search}
            onChange={handleSearchChange}
            leftElement={<Search className="h-4 w-4" />}
          />
        </div>

        <Card shadow="sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Approved Studies</h2>
              {data && (
                <span className="text-sm text-slate-500">{data.meta.total} total records</span>
              )}
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {isLoading ? (
              <Loader centered label="Loading registry..." />
            ) : isError ? (
              <EmptyState title="Failed to load registry" description="Please try refreshing the page." />
            ) : !data?.data.length ? (
              <EmptyState
                title="No studies found"
                description={debouncedSearch ? 'Try a different search term.' : 'No approved studies in the registry yet.'}
              />
            ) : (
              <>
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeader>Reference No.</TableHeader>
                      <TableHeader>Title</TableHeader>
                      <TableHeader>Institution</TableHeader>
                      <TableHeader>Approval Date</TableHeader>
                      <TableHeader>Expiry</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader></TableHeader>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {data.data.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-slate-900">
                            {entry.referenceNumber}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-slate-900 line-clamp-2">{entry.title}</span>
                        </TableCell>
                        <TableCell>{entry.institutionName}</TableCell>
                        <TableCell>
                          {entry.approvalDate
                            ? format(new Date(entry.approvalDate), 'dd MMM yyyy')
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {entry.expiryDate
                            ? format(new Date(entry.expiryDate), 'dd MMM yyyy')
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
                            {entry.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/registry/${entry.id}`}
                            className="inline-flex items-center gap-1 text-xs text-rnec-teal hover:text-rnec-navy font-medium transition-colors"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </Link>
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
    </div>
  )
}
