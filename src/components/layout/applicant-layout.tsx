'use client'

import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Award,
  Edit,
  RefreshCw,
  BarChart2,
  AlertTriangle,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'
import { SidebarLink } from '@/components/layout/sidebar-link'
import { NotificationBell } from '@/components/layout/notification-bell'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Avatar } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/lib/api/auth.api'
import { toast } from '@/components/ui/toast'
import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '@/lib/api/notifications.api'
import { tenantsApi } from '@/lib/api/tenants.api'
import { Building2 } from 'lucide-react'

interface ApplicantLayoutProps {
  children: React.ReactNode
}

const navLinks = [
  { href: '/applicant/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, exact: true },
  { href: '/applicant/applications', label: 'My Applications', icon: <FileText className="h-5 w-5" /> },
  { href: '/applicant/payments', label: 'Payments', icon: <CreditCard className="h-5 w-5" /> },
  { href: '/applicant/certificates', label: 'Certificates', icon: <Award className="h-5 w-5" /> },
  { href: '/applicant/amendments', label: 'Amendments', icon: <Edit className="h-5 w-5" /> },
  { href: '/applicant/renewals', label: 'Renewals', icon: <RefreshCw className="h-5 w-5" /> },
  { href: '/applicant/progress-reports', label: 'Progress Reports', icon: <BarChart2 className="h-5 w-5" /> },
  { href: '/applicant/adverse-events', label: 'Adverse Events', icon: <AlertTriangle className="h-5 w-5" /> },
  { href: '/applicant/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
]

export function ApplicantLayout({ children }: ApplicantLayoutProps) {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.getNotifications({ isRead: false, limit: 1 }),
    refetchInterval: 30000,
  })

  const { data: tenant } = useQuery({
    queryKey: ['tenant', user?.tenantId],
    queryFn: () => tenantsApi.getTenant(user!.tenantId!),
    enabled: !!user?.tenantId,
  })

  const unreadCount = notifications?.meta?.total ?? 0

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore logout errors
    } finally {
      clearAuth()
      router.push('/login')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-rnec-navy transition-transform duration-300',
          'lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-rnec-gold tracking-wider">RNEC</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              exact={link.exact}
            />
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between gap-4 bg-white px-6 shadow-sm border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Breadcrumb items={[]} showHome={false} />
            {tenant && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5">
                <Building2 className="h-3.5 w-3.5 text-rnec-navy/60 shrink-0" />
                <span className="text-xs font-medium text-slate-700 truncate max-w-45">{tenant.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell unreadCount={unreadCount} />
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              size="sm"
            />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-white p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
