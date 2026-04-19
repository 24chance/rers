'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Users, Building2, Shield, FileSearch } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { api } from '@/lib/api/client'

interface SystemDashboard {
  totalUsers: number
  totalTenants: number
  totalRoles: number
  recentAuditEvents: number
}

async function getSystemDashboard(): Promise<SystemDashboard> {
  const res = await api.get<SystemDashboard>('/dashboards/system-admin')
  return res.data
}

export default function SystemAdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'system-admin'],
    queryFn: getSystemDashboard,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Administration</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform configuration and management</p>
      </div>

      {isLoading ? (
        <Loader centered label="Loading..." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Users"
              value={data?.totalUsers ?? '—'}
              icon={<Users className="h-5 w-5 text-rnec-teal" />}
              iconBg="bg-rnec-teal/10"
            />
            <MetricCard
              label="Tenants"
              value={data?.totalTenants ?? '—'}
              icon={<Building2 className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-50"
            />
            <MetricCard
              label="Role Definitions"
              value={data?.totalRoles ?? '—'}
              icon={<Shield className="h-5 w-5 text-purple-600" />}
              iconBg="bg-purple-50"
            />
            <MetricCard
              label="Audit Events (7d)"
              value={data?.recentAuditEvents ?? '—'}
              icon={<FileSearch className="h-5 w-5 text-slate-600" />}
              iconBg="bg-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { href: '/system-admin/users', label: 'User Management', desc: 'Create, edit, and manage user accounts and roles.', icon: <Users className="h-5 w-5" /> },
              { href: '/system-admin/tenants', label: 'Tenant Management', desc: 'Configure IRB institutions and settings.', icon: <Building2 className="h-5 w-5" /> },
              { href: '/system-admin/audit-logs', label: 'Audit Logs', desc: 'Review system activity and security events.', icon: <FileSearch className="h-5 w-5" /> },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Card shadow="sm" hoverable>
                  <CardBody>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rnec-navy/10 text-rnec-navy">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
