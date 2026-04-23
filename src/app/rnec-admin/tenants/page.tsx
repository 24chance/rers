'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

const schema = z.object({
  name: z.string().min(2, 'Institution name is required'),
  code: z.string().min(2, 'Code is required').max(12, 'Max 12 characters').toUpperCase(),
  type: z.string().min(1, 'Type is required'),
  adminFirstName: z.string().min(1, 'First name is required'),
  adminLastName: z.string().min(1, 'Last name is required'),
  adminEmail: z.string().email('Valid email required'),
  adminPhone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function RnecTenantsPage() {
  const queryClient = useQueryClient()
  const [addModalOpen, setAddModalOpen] = useState(false)

  const { data: tenants, isLoading, isError } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsApi.getTenants(),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    mutationFn: (d: FormData) =>
      tenantsApi.createTenant({
        name: d.name,
        code: d.code,
        type: d.type,
        admin: {
          firstName: d.adminFirstName,
          lastName: d.adminLastName,
          email: d.adminEmail,
          phone: d.adminPhone,
        },
      }),
    onSuccess: () => {
      toast.success('Tenant created. IRB Admin credentials sent to their email.')
      setAddModalOpen(false)
      reset()
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

      <Modal
        open={addModalOpen}
        onOpenChange={(open) => { if (!open) { setAddModalOpen(false); reset() } }}
        title="Add New Tenant"
        description="Create a new IRB institution. The admin will receive login credentials by email."
        size="lg"
      >
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} noValidate className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Institution Details</p>
            <div className="space-y-4">
              <Input
                label="Institution Name"
                required
                placeholder="e.g. Kigali University IRB"
                error={errors.name?.message}
                {...register('name')}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Institution Code"
                  required
                  placeholder="e.g. KU-IRB"
                  helperText="Unique identifier (max 12 chars)"
                  error={errors.code?.message}
                  {...register('code')}
                />
                <Select
                  label="Type"
                  required
                  options={[
                    { value: '', label: 'Select type...' },
                    { value: 'IRB', label: 'Institutional Review Board' },
                    { value: 'ETHICS_COMMITTEE', label: 'Ethics Committee' },
                    { value: 'RESEARCH_UNIT', label: 'Research Unit' },
                    { value: 'UNIVERSITY', label: 'University' },
                    { value: 'HOSPITAL', label: 'Hospital' },
                  ]}
                  error={errors.type?.message}
                  {...register('type')}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">IRB Admin Account</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First name"
                  required
                  placeholder="Alice"
                  error={errors.adminFirstName?.message}
                  {...register('adminFirstName')}
                />
                <Input
                  label="Last name"
                  required
                  placeholder="Nkusi"
                  error={errors.adminLastName?.message}
                  {...register('adminLastName')}
                />
              </div>
              <Input
                label="Admin email"
                type="email"
                required
                placeholder="admin@institution.ac.rw"
                error={errors.adminEmail?.message}
                {...register('adminEmail')}
              />
              <Input
                label="Phone number"
                type="tel"
                placeholder="+250 700 000 000"
                error={errors.adminPhone?.message}
                {...register('adminPhone')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" type="button" onClick={() => { setAddModalOpen(false); reset() }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting || createMutation.isPending}>
              Create Tenant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
