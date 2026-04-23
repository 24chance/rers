'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Users, Building2, Shield, FileSearch, Activity, Settings, ChevronRight } from 'lucide-react'
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
  const res = await api.get<{ data: SystemDashboard }>('/dashboards/system_admin')
  return res.data.data
}

const quickLinks = [
  {
    href: '/system-admin/users',
    label: 'User Management',
    desc: 'Create, edit, and manage user accounts and roles.',
    icon: Users,
    color: 'text-rnec-teal',
    bg: 'bg-rnec-teal/10',
  },
  {
    href: '/system-admin/tenants',
    label: 'Tenant Management',
    desc: 'Configure IRB institutions and their settings.',
    icon: Building2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    href: '/system-admin/configuration',
    label: 'System Configuration',
    desc: 'Manage global platform settings and workflows.',
    icon: Settings,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    href: '/system-admin/audit-logs',
    label: 'Audit Logs',
    desc: 'Review system activity and security events.',
    icon: FileSearch,
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
]

export default function SystemAdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'system-admin'],
    queryFn: getSystemDashboard,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Administration</h1>
          <p className="text-slate-500 text-sm mt-0.5">Platform configuration and management</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-rnec-navy/5 px-3 py-1.5 text-xs font-medium text-rnec-navy">
          <Activity className="h-3.5 w-3.5" />
          System Admin Portal
        </div>
      </div>

      {isLoading ? (
        <Loader centered label="Loading system overview..." />
      ) : isError ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4 text-sm text-red-700">
          Failed to load system dashboard. Please refresh.
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Users"
              value={data?.totalUsers ?? 0}
              icon={<Users className="h-5 w-5 text-rnec-teal" />}
              iconBg="bg-rnec-teal/10"
            />
            <MetricCard
              label="Tenants"
              value={data?.totalTenants ?? 0}
              icon={<Building2 className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-50"
            />
            <MetricCard
              label="Role Definitions"
              value={data?.totalRoles ?? 0}
              icon={<Shield className="h-5 w-5 text-purple-600" />}
              iconBg="bg-purple-50"
            />
            <MetricCard
              label="Audit Events (7d)"
              value={data?.recentAuditEvents ?? 0}
              icon={<FileSearch className="h-5 w-5 text-slate-600" />}
              iconBg="bg-slate-100"
            />
          </div>

          {/* Quick access */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card shadow="sm" hoverable className="h-full">
                    <CardBody>
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                          <item.icon className={`h-5 w-5 ${item.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.desc}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-end">
                        <span className="text-xs font-medium text-rnec-teal flex items-center gap-0.5">
                          Open <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* System health summary */}
          <Card shadow="sm">
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900">Platform Health</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3">
                  <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">API Status</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-semibold text-emerald-800">Operational</span>
                  </div>
                </div>
                <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                  <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Database</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-sm font-semibold text-blue-800">Connected</span>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Audit Events (7d)</p>
                  <div className="mt-1">
                    <span className="text-sm font-semibold text-slate-800">{data?.recentAuditEvents ?? 0} recorded</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
