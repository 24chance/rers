'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { CreditCard } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { applicationsApi } from '@/lib/api/applications.api'
import { ApplicationStatus } from '@/types'
import { format } from 'date-fns'
import { clsx } from 'clsx'

export default function ApplicantPaymentsPage() {
  // Get applications that have payment status
  const { data, isLoading } = useQuery({
    queryKey: ['applicant-payment-applications'],
    queryFn: () => applicationsApi.getApplications({ limit: 50 }),
  })

  const paymentApplications = data?.data.filter(
    (a) =>
      a.status === ApplicationStatus.PAYMENT_PENDING ||
      a.status === ApplicationStatus.PAYMENT_VERIFIED,
  ) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <p className="text-slate-500 text-sm mt-0.5">View and manage application payments</p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">Payment Status</h2>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading..." />
          ) : !paymentApplications.length ? (
            <EmptyState
              icon={<CreditCard className="h-8 w-8 text-slate-400" />}
              title="No payment records"
              description="Payment invoices will appear here after your application passes screening."
            />
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Application</TableHeader>
                  <TableHeader>Reference</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {paymentApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <span className="text-sm font-medium text-slate-900 line-clamp-1">{app.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{app.referenceNumber}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell>
                      <Link href={`/applicant/applications/${app.id}?tab=payments`}>
                        <Button variant="outline" size="sm" leftIcon={<CreditCard className="h-3.5 w-3.5" />}>
                          View Invoice
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
