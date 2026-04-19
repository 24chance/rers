'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { applicationsApi } from '@/lib/api/applications.api'
import { reviewsApi } from '@/lib/api/reviews.api'
import { ApplicationStatus } from '@/types'
import { clsx } from 'clsx'

export default function IrbReviewsPage() {
  const { data: underReview, isLoading } = useQuery({
    queryKey: ['applications-under-review'],
    queryFn: () =>
      applicationsApi.getApplications({ status: ApplicationStatus.UNDER_REVIEW, limit: 30 }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
        <p className="text-slate-500 text-sm mt-0.5">Applications currently under peer review</p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">Under Review</h2>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered />
          ) : !underReview?.data.length ? (
            <EmptyState
              icon={<ClipboardList className="h-8 w-8 text-slate-400" />}
              title="No applications under review"
            />
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Ref No.</TableHeader>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {underReview.data.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell><span className="font-mono text-xs">{app.referenceNumber}</span></TableCell>
                    <TableCell><span className="text-sm font-medium">{app.title}</span></TableCell>
                    <TableCell><span className="text-xs text-slate-600">{app.type.replace(/_/g, ' ')}</span></TableCell>
                    <TableCell>
                      <Link href={`/irb-admin/applications/${app.id}`} className="text-xs text-rnec-teal hover:text-rnec-navy font-medium">
                        View
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
