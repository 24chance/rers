'use client'

import { Shield, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { UserRole } from '@/types'

interface RolePermission {
  module: string
  permissions: string[]
}

const roleDefinitions: Record<UserRole, { label: string; description: string; color: string; permissions: RolePermission[] }> = {
  [UserRole.APPLICANT]: {
    label: 'Applicant',
    description: 'Researchers and investigators submitting ethics applications.',
    color: 'bg-blue-100 text-blue-700',
    permissions: [
      { module: 'Applications', permissions: ['Create application', 'Edit draft', 'Submit application', 'View own applications'] },
      { module: 'Documents', permissions: ['Upload documents', 'Delete own documents'] },
      { module: 'Queries', permissions: ['View queries', 'Respond to queries'] },
      { module: 'Payments', permissions: ['View invoice', 'Submit payment proof'] },
      { module: 'Monitoring', permissions: ['Submit progress reports', 'Submit amendments', 'Submit renewals', 'Report adverse events'] },
      { module: 'Certificates', permissions: ['Download own certificates'] },
    ],
  },
  [UserRole.REVIEWER]: {
    label: 'Reviewer',
    description: 'Ethics committee members assigned to review applications.',
    color: 'bg-purple-100 text-purple-700',
    permissions: [
      { module: 'Reviews', permissions: ['View assigned applications', 'Submit review', 'Update review before completion'] },
      { module: 'Documents', permissions: ['View application documents'] },
      { module: 'Applications', permissions: ['View assigned application details'] },
    ],
  },
  [UserRole.IRB_ADMIN]: {
    label: 'IRB Admin',
    description: 'Institutional Review Board administrators managing applications within an institution.',
    color: 'bg-amber-100 text-amber-700',
    permissions: [
      { module: 'Applications', permissions: ['View all tenant applications', 'Screen applications', 'Raise queries', 'Assign reviewers', 'Generate invoices'] },
      { module: 'Reviews', permissions: ['View all reviews', 'Manage reviewer assignments'] },
      { module: 'Decisions', permissions: ['View decisions', 'Submit for decision'] },
      { module: 'Users', permissions: ['View tenant users', 'Change user roles within tenant'] },
      { module: 'Settings', permissions: ['Configure IRB settings', 'Set fee structure'] },
    ],
  },
  [UserRole.FINANCE_OFFICER]: {
    label: 'Finance Officer',
    description: 'Financial team members responsible for payment verification.',
    color: 'bg-emerald-100 text-emerald-700',
    permissions: [
      { module: 'Payments', permissions: ['View all payments', 'Verify payments', 'Reject payments', 'Generate receipts'] },
      { module: 'Invoices', permissions: ['View all invoices'] },
      { module: 'Receipts', permissions: ['Download receipts', 'View payment history'] },
    ],
  },
  [UserRole.CHAIRPERSON]: {
    label: 'Chairperson',
    description: 'Chair of the ethics board who records final decisions.',
    color: 'bg-rnec-teal/20 text-rnec-teal',
    permissions: [
      { module: 'Decisions', permissions: ['Record final decisions', 'Approve applications', 'Conditionally approve', 'Reject applications', 'Defer applications'] },
      { module: 'Meetings', permissions: ['Schedule board meetings', 'View meeting history', 'Manage meeting agenda'] },
      { module: 'Applications', permissions: ['View all applications in decision stage', 'View review summaries'] },
    ],
  },
  [UserRole.RNEC_ADMIN]: {
    label: 'RNEC Admin',
    description: 'National-level administrators with cross-tenant oversight.',
    color: 'bg-rnec-navy/10 text-rnec-navy',
    permissions: [
      { module: 'Applications', permissions: ['View all applications across all tenants'] },
      { module: 'Reports', permissions: ['View national reports', 'Export statistics'] },
      { module: 'Oversight', permissions: ['View oversight flags', 'Monitor compliance'] },
      { module: 'Tenants', permissions: ['View tenant list', 'Toggle tenant active status'] },
      { module: 'Users', permissions: ['View all users across tenants', 'Change any user role'] },
      { module: 'Settings', permissions: ['Configure national settings and policies'] },
    ],
  },
  [UserRole.SYSTEM_ADMIN]: {
    label: 'System Admin',
    description: 'Platform superadmins with full system access.',
    color: 'bg-red-100 text-red-700',
    permissions: [
      { module: 'Users', permissions: ['Full user management', 'Create/delete users', 'Change any role'] },
      { module: 'Tenants', permissions: ['Create tenants', 'Configure tenants', 'Activate/deactivate tenants'] },
      { module: 'Roles', permissions: ['View role definitions', 'Audit role assignments'] },
      { module: 'Configuration', permissions: ['System-wide configuration', 'Feature flags', 'Email templates'] },
      { module: 'Audit Logs', permissions: ['View all audit logs', 'Export audit reports'] },
      { module: 'All Modules', permissions: ['Full read/write access to all system modules'] },
    ],
  },
}

export default function SystemRolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Role Definitions</h1>
        <p className="text-slate-500 text-sm mt-0.5">System roles and their associated permissions</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Object.entries(roleDefinitions).map(([roleKey, def]) => (
          <Card key={roleKey} shadow="sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Shield className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900">{def.label}</h2>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${def.color}`}>
                      {roleKey}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{def.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {def.permissions.map((perm) => (
                  <div key={perm.module} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                      {perm.module}
                    </p>
                    <ul className="space-y-1">
                      {perm.permissions.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-600">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
