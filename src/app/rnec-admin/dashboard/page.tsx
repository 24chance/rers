'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Globe, FileText, CheckCircle, XCircle, Clock, Building2, TrendingUp } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { api } from '@/lib/api/client'
import type { Tenant } from '@/types'

interface TenantStat {
  tenant: Pick<Tenant, 'id' | 'name' | 'code' | 'isActive'>
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
  const res = await api.get<{ data: RnecDashboard }>('/dashboards/rnec_admin')
  return res.data.data
}

export default function RnecAdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'rnec-admin'],
    queryFn: getRnecDashboard,
  })

  const approvalRate =
    data && data.totalApplications > 0
      ? Math.round((data.totalApproved / data.totalApplications) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">National Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">Cross-tenant research ethics statistics</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-rnec-teal/10 px-3 py-1.5 text-xs font-medium text-rnec-teal">
          <Globe className="h-3.5 w-3.5" />
          RNEC Admin Portal
        </div>
      </div>

      {isLoading ? (
        <Loader centered label="Loading national overview..." />
      ) : isError ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4 text-sm text-red-700">
          Failed to load dashboard. Please refresh.
        </div>
      ) : (
        <>
          {/* Stats */}
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
              label="Under Review"
              value={data?.totalPending ?? 0}
              icon={<Clock className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-50"
            />
            <MetricCard
              label="Rejected"
              value={data?.totalRejected ?? 0}
              icon={<XCircle className="h-5 w-5 text-red-500" />}
              iconBg="bg-red-50"
            />
          </div>

          {/* Approval rate banner */}
          {(data?.totalApplications ?? 0) > 0 && (
            <Card shadow="sm">
              <CardBody>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">National Approval Rate</p>
                      <p className="text-xs text-slate-500">Across all active institutions</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Approved vs total</span>
                      <span className="text-sm font-bold text-emerald-700">{approvalRate}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                        style={{ width: `${approvalRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Per-institution breakdown */}
          <Card shadow="sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <h2 className="text-base font-semibold text-slate-900">By Institution (IRB)</h2>
                </div>
                <Link
                  href="/rnec-admin/tenants"
                  className="text-xs font-medium text-rnec-teal hover:text-rnec-navy"
                >
                  Manage tenants
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {!data?.tenantStats?.length ? (
                <EmptyState
                  title="No institution data"
                  description="No active institutions are registered yet."
                />
              ) : (
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeader>Institution</TableHeader>
                      <TableHeader>Code</TableHeader>
                      <TableHeader>Total</TableHeader>
                      <TableHeader>Approved</TableHeader>
                      <TableHeader>Under Review</TableHeader>
                      <TableHeader>Rejected</TableHeader>
                      <TableHeader>Approval %</TableHeader>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {data.tenantStats.map((stat) => {
                      const rate =
                        stat.total > 0 ? Math.round((stat.approved / stat.total) * 100) : 0
                      return (
                        <TableRow key={stat.tenant.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rnec-navy/10 text-rnec-navy text-xs font-bold">
                                {stat.tenant.name.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-slate-900">
                                {stat.tenant.name}
                              </span>
                              {!stat.tenant.isActive && (
                                <span className="text-xs bg-red-100 text-red-600 rounded-full px-1.5 py-0.5">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-slate-500">{stat.tenant.code}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold text-slate-900">{stat.total}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-emerald-700">{stat.approved}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-amber-700">{stat.pending}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-red-700">{stat.rejected}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-600 tabular-nums">{rate}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
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
