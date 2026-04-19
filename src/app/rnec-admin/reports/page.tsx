'use client'

import { useQuery } from '@tanstack/react-query'
import { BarChart2, FileText, CheckCircle, XCircle } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { api } from '@/lib/api/client'
import type { Tenant } from '@/types'

interface TenantReport {
  tenant: Tenant
  totalApplications: number
  approved: number
  rejected: number
  pending: number
  avgReviewDays: number
}

interface NationalReport {
  period: string
  totalApplications: number
  totalApproved: number
  totalRejected: number
  totalPending: number
  avgReviewDays: number
  tenantReports: TenantReport[]
  applicationsByType: { type: string; count: number }[]
  monthlyTrend: { month: string; submitted: number; approved: number }[]
}

async function getNationalReport(): Promise<NationalReport> {
  const res = await api.get<NationalReport>('/reports/national')
  return res.data
}

export default function RnecReportsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['rnec-national-report'],
    queryFn: getNationalReport,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">National Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Aggregate statistics across all IRB institutions</p>
      </div>

      {isLoading ? (
        <Loader centered label="Loading reports..." />
      ) : isError ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4 text-sm text-red-700">
          Failed to load report data. Please refresh.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Applications"
              value={data?.totalApplications ?? 0}
              icon={<BarChart2 className="h-5 w-5 text-rnec-teal" />}
              iconBg="bg-rnec-teal/10"
            />
            <MetricCard
              label="Total Approved"
              value={data?.totalApproved ?? 0}
              icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
            />
            <MetricCard
              label="Total Rejected"
              value={data?.totalRejected ?? 0}
              icon={<XCircle className="h-5 w-5 text-red-600" />}
              iconBg="bg-red-50"
            />
            <MetricCard
              label="Avg Review Days"
              value={data?.avgReviewDays ?? 0}
              icon={<FileText className="h-5 w-5 text-purple-600" />}
              iconBg="bg-purple-50"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications by Type */}
            <Card shadow="sm">
              <CardHeader>
                <h2 className="text-base font-semibold">Applications by Review Type</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {(data?.applicationsByType ?? []).map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{item.type.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-2 rounded-full bg-rnec-teal"
                          style={{ width: `${Math.min(item.count * 3, 160)}px` }}
                        />
                        <span className="text-sm font-semibold text-slate-900 w-8 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                  {!data?.applicationsByType?.length && (
                    <p className="text-sm text-slate-500">No data available.</p>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Monthly Trend */}
            <Card shadow="sm">
              <CardHeader>
                <h2 className="text-base font-semibold">Monthly Trend</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {(data?.monthlyTrend ?? []).map((item) => (
                    <div key={item.month} className="flex items-center gap-4">
                      <span className="text-xs text-slate-500 w-16 shrink-0">{item.month}</span>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-1.5 rounded-full bg-rnec-teal"
                            style={{ width: `${Math.min(item.submitted * 4, 200)}px` }}
                          />
                          <span className="text-xs text-slate-500">{item.submitted} submitted</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-1.5 rounded-full bg-emerald-500"
                            style={{ width: `${Math.min(item.approved * 4, 200)}px` }}
                          />
                          <span className="text-xs text-slate-500">{item.approved} approved</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!data?.monthlyTrend?.length && (
                    <p className="text-sm text-slate-500">No trend data available.</p>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Per-institution breakdown */}
          <Card shadow="sm">
            <CardHeader>
              <h2 className="text-base font-semibold">Performance by Institution</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {(data?.tenantReports ?? []).map((report) => (
                  <div
                    key={report.tenant.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{report.tenant.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{report.tenant.code}</p>
                    </div>
                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{report.totalApplications}</p>
                        <p className="text-xs text-slate-500">Total</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-700">{report.approved}</p>
                        <p className="text-xs text-slate-500">Approved</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-red-700">{report.rejected}</p>
                        <p className="text-xs text-slate-500">Rejected</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-amber-700">{report.pending}</p>
                        <p className="text-xs text-slate-500">Pending</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-purple-700">{report.avgReviewDays}d</p>
                        <p className="text-xs text-slate-500">Avg. Review</p>
                      </div>
                    </div>
                  </div>
                ))}
                {!data?.tenantReports?.length && (
                  <p className="text-sm text-slate-500">No institution data available.</p>
                )}
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
