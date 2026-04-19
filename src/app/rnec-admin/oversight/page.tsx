'use client'

import { useQuery } from '@tanstack/react-query'
import { Shield, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { api } from '@/lib/api/client'
import { format } from 'date-fns'

interface OversightFlag {
  id: string
  applicationId: string
  referenceNumber: string
  title: string
  tenantName: string
  type: 'OVERDUE_REVIEW' | 'ADVERSE_EVENT' | 'PROTOCOL_DEVIATION' | 'NON_COMPLIANCE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  description: string
  flaggedAt: string
}

interface OversightStats {
  totalFlags: number
  highSeverity: number
  overdueReviews: number
  resolvedThisMonth: number
  flags: OversightFlag[]
}

async function getOversightData(): Promise<OversightStats> {
  const res = await api.get<OversightStats>('/oversight/flags')
  return res.data
}

const severityColors: Record<string, string> = {
  HIGH: 'text-red-700 bg-red-100',
  MEDIUM: 'text-amber-700 bg-amber-100',
  LOW: 'text-slate-600 bg-slate-100',
}

const flagTypeLabels: Record<string, string> = {
  OVERDUE_REVIEW: 'Overdue Review',
  ADVERSE_EVENT: 'Adverse Event',
  PROTOCOL_DEVIATION: 'Protocol Deviation',
  NON_COMPLIANCE: 'Non-Compliance',
}

export default function RnecOversightPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['rnec-oversight'],
    queryFn: getOversightData,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Oversight</h1>
        <p className="text-slate-500 text-sm mt-0.5">Monitor compliance and flag issues across all institutions</p>
      </div>

      {isLoading ? (
        <Loader centered label="Loading oversight data..." />
      ) : isError ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4 text-sm text-red-700">
          Failed to load oversight data. Please refresh.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Flags"
              value={data?.totalFlags ?? 0}
              icon={<Shield className="h-5 w-5 text-rnec-teal" />}
              iconBg="bg-rnec-teal/10"
            />
            <MetricCard
              label="High Severity"
              value={data?.highSeverity ?? 0}
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
              iconBg="bg-red-50"
            />
            <MetricCard
              label="Overdue Reviews"
              value={data?.overdueReviews ?? 0}
              icon={<Clock className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-50"
            />
            <MetricCard
              label="Resolved This Month"
              value={data?.resolvedThisMonth ?? 0}
              icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
            />
          </div>

          <Card shadow="sm">
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900">Active Oversight Flags</h2>
            </CardHeader>
            <CardBody className="p-0">
              {!data?.flags?.length ? (
                <EmptyState
                  icon={<Shield className="h-8 w-8 text-slate-400" />}
                  title="No active flags"
                  description="All institutions are currently compliant."
                />
              ) : (
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeader>Reference</TableHeader>
                      <TableHeader>Study</TableHeader>
                      <TableHeader>Institution</TableHeader>
                      <TableHeader>Flag Type</TableHeader>
                      <TableHeader>Severity</TableHeader>
                      <TableHeader>Description</TableHeader>
                      <TableHeader>Flagged</TableHeader>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {data.flags.map((flag) => (
                      <TableRow key={flag.id}>
                        <TableCell>
                          <span className="font-mono text-xs font-semibold">{flag.referenceNumber}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-slate-900 line-clamp-1">{flag.title}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">{flag.tenantName}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-700">{flagTypeLabels[flag.type] ?? flag.type}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${severityColors[flag.severity] ?? 'text-slate-600 bg-slate-100'}`}>
                            {flag.severity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500 line-clamp-2 max-w-xs">{flag.description}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500">
                            {format(new Date(flag.flaggedAt), 'dd MMM yyyy')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
