'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { CheckSquare } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { applicationsApi } from '@/lib/api/applications.api'
import { ApplicationStatus } from '@/types'
import { format } from 'date-fns'

export default function IrbDecisionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['decided-applications'],
    queryFn: () =>
      applicationsApi.getApplications({ status: ApplicationStatus.APPROVED, limit: 30 }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Decisions</h1>
        <p className="text-slate-500 text-sm mt-0.5">Applications with recorded decisions</p>
      </div>

      <Card shadow="sm">
        <CardHeader><h2 className="text-base font-semibold text-slate-900">Approved Applications</h2></CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered />
          ) : !data?.data.length ? (
            <EmptyState icon={<CheckSquare className="h-8 w-8 text-slate-400" />} title="No decisions yet" />
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Ref No.</TableHeader>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader></TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {data.data.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell><span className="font-mono text-xs">{app.referenceNumber}</span></TableCell>
                    <TableCell><span className="text-sm font-medium">{app.title}</span></TableCell>
                    <TableCell><StatusBadge status={app.status} /></TableCell>
                    <TableCell><span className="text-xs text-slate-500">{format(new Date(app.updatedAt), 'dd MMM yyyy')}</span></TableCell>
                    <TableCell>
                      <Link href={`/irb-admin/applications/${app.id}`} className="text-xs text-rnec-teal font-medium">View</Link>
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
