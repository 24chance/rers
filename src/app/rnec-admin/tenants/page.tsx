'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Plus } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { toast } from '@/components/ui/toast'
import { tenantsApi } from '@/lib/api/tenants.api'
import { clsx } from 'clsx'

export default function RnecTenantsPage() {
  const queryClient = useQueryClient()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState('IRB')

  const { data: tenants, isLoading, isError } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsApi.getTenants(),
  })

  const createMutation = useMutation({
    mutationFn: () => tenantsApi.createTenant({ name, code, type }),
    onSuccess: () => {
      toast.success('Tenant created successfully.')
      setAddModalOpen(false)
      setName('')
      setCode('')
      setType('IRB')
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to create tenant.')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      tenantsApi.updateTenant(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success('Tenant updated.')
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Update failed.')
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">IRB Tenants</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage institutional review boards</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddModalOpen(true)}>
          Add Tenant
        </Button>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">
            All Tenants
            {tenants && <span className="ml-2 text-sm font-normal text-slate-400">({tenants.length})</span>}
          </h2>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading tenants..." />
          ) : isError ? (
            <EmptyState title="Failed to load" description="Please refresh." />
          ) : !tenants?.length ? (
            <EmptyState
              icon={<Building2 className="h-8 w-8 text-slate-400" />}
              title="No tenants yet"
              description="Add your first IRB institution."
              action={
                <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddModalOpen(true)}>
                  Add Tenant
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Code</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <span className="text-sm font-medium text-slate-900">{tenant.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-slate-600">{tenant.code}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600">{tenant.type}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={clsx(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                          tenant.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
                        )}
                      >
                        {tenant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleMutation.mutate({ id: tenant.id, isActive: !tenant.isActive })}
                        disabled={toggleMutation.isPending}
                      >
                        {tenant.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Add Tenant Modal */}
      <Modal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        title="Add New Tenant"
        description="Create a new IRB institution on the platform."
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Institution Name"
            required
            placeholder="e.g. Kigali University IRB"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Institution Code"
            required
            placeholder="e.g. KIGALI-IRB (unique)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'IRB', label: 'Institutional Review Board' },
              { value: 'ETHICS_COMMITTEE', label: 'Ethics Committee' },
              { value: 'RESEARCH_UNIT', label: 'Research Unit' },
            ]}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={createMutation.isPending}
              disabled={!name.trim() || !code.trim()}
              onClick={() => createMutation.mutate()}
            >
              Create Tenant
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
