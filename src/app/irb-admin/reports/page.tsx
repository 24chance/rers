'use client'

import { useQuery } from '@tanstack/react-query'
import { BarChart2 } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { dashboardsApi } from '@/lib/api/dashboards.api'
import { UserRole } from '@/types'
import type { AdminDashboard } from '@/lib/api/dashboards.api'

export default function IrbReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'irb-admin'],
    queryFn: () => dashboardsApi.getDashboard(UserRole.IRB_ADMIN),
  })

  const dashboard = data as AdminDashboard | undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Statistical overview of IRB activity</p>
      </div>

      {isLoading ? (
        <Loader centered />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Applications" value={dashboard?.totalApplications ?? 0} icon={<BarChart2 className="h-5 w-5 text-rnec-teal" />} iconBg="bg-rnec-teal/10" />
            <MetricCard label="Pending Screening" value={dashboard?.pendingScreening ?? 0} icon={<BarChart2 className="h-5 w-5 text-amber-600" />} iconBg="bg-amber-50" />
            <MetricCard label="Under Review" value={dashboard?.underReview ?? 0} icon={<BarChart2 className="h-5 w-5 text-purple-600" />} iconBg="bg-purple-50" />
            <MetricCard label="Decisions This Month" value={dashboard?.decisionsThisMonth ?? 0} icon={<BarChart2 className="h-5 w-5 text-emerald-600" />} iconBg="bg-emerald-50" />
          </div>

          <Card shadow="sm">
            <CardHeader><h2 className="text-base font-semibold">Applications by Status</h2></CardHeader>
            <CardBody>
              <div className="space-y-3">
                {(dashboard?.applicationsByStatus ?? []).map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{item.status.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 rounded-full bg-rnec-teal" style={{ width: `${Math.min(item.count * 4, 200)}px` }} />
                      <span className="text-sm font-semibold text-slate-900 w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
