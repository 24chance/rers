'use client'

import { useQuery } from '@tanstack/react-query'
import { Globe, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { api } from '@/lib/api/client'
import type { Tenant } from '@/types'

interface TenantStat {
  tenant: Tenant
  total: number
  approved: number
  pending: number
  rejected: number
}

interface RnecDashboard {
  totalApplications: number
  totalApproved: number
  totalPending: number
  totalRejected: number
  tenantStats: TenantStat[]
}

async function getRnecDashboard(): Promise<RnecDashboard> {
  const res = await api.get<RnecDashboard>('/dashboards/rnec-admin')
  return res.data
}

export default function RnecAdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'rnec-admin'],
    queryFn: getRnecDashboard,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">National Overview</h1>
        <p className="text-slate-500 text-sm mt-0.5">Cross-tenant research ethics statistics</p>
      </div>

      {isLoading ? (
        <Loader centered label="Loading..." />
      ) : isError ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4 text-sm text-red-700">
          Failed to load dashboard.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Applications"
              value={data?.totalApplications ?? 0}
              icon={<Globe className="h-5 w-5 text-rnec-teal" />}
              iconBg="bg-rnec-teal/10"
            />
            <MetricCard
              label="Approved"
              value={data?.totalApproved ?? 0}
              icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
            />
            <MetricCard
              label="Pending"
              value={data?.totalPending ?? 0}
              icon={<Clock className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-50"
            />
            <MetricCard
              label="Rejected"
              value={data?.totalRejected ?? 0}
              icon={<XCircle className="h-5 w-5 text-red-600" />}
              iconBg="bg-red-50"
            />
          </div>

          {/* Per-tenant breakdown */}
          <Card shadow="sm">
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900">By Institution (IRB)</h2>
            </CardHeader>
            <CardBody className="p-0">
              {!data?.tenantStats?.length ? (
                <EmptyState title="No institution data" description="No tenants registered yet." />
              ) : (
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeader>Institution</TableHeader>
                      <TableHeader>Code</TableHeader>
                      <TableHeader>Total</TableHeader>
                      <TableHeader>Approved</TableHeader>
                      <TableHeader>Pending</TableHeader>
                      <TableHeader>Rejected</TableHeader>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {data.tenantStats.map((stat) => (
                      <TableRow key={stat.tenant.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">{stat.tenant.name}</span>
                            {!stat.tenant.isActive && (
                              <span className="text-xs bg-red-100 text-red-600 rounded-full px-1.5 py-0.5">Inactive</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-slate-600">{stat.tenant.code}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold">{stat.total}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-emerald-700 font-medium">{stat.approved}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-amber-700 font-medium">{stat.pending}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-red-700 font-medium">{stat.rejected}</span>
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
