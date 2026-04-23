'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Building2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/card'
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

const tenantTypeOptions = [
  { value: 'UNIVERSITY', label: 'University' },
  { value: 'HOSPITAL', label: 'Hospital / Medical Institution' },
  { value: 'RESEARCH_INSTITUTE', label: 'Research Institute' },
  { value: 'NGO', label: 'NGO / Non-Profit' },
  { value: 'GOVERNMENT', label: 'Government Agency' },
  { value: 'OTHER', label: 'Other' },
]

const schema = z.object({
  name: z.string().min(2, 'Institution name is required'),
  code: z.string().min(2, 'Code is required').max(12, 'Code must be 12 characters or less').toUpperCase(),
  type: z.string().min(1, 'Institution type is required'),
  logoUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  adminFirstName: z.string().min(1, 'First name is required'),
  adminLastName: z.string().min(1, 'Last name is required'),
  adminEmail: z.string().email('Valid email required'),
  adminPhone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function SystemTenantsPage() {
  const queryClient = useQueryClient()
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const { data: tenants, isLoading, isError } = useQuery({
    queryKey: ['system-tenants'],
    queryFn: tenantsApi.getTenants,
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
        logoUrl: d.logoUrl || undefined,
        admin: {
          firstName: d.adminFirstName,
          lastName: d.adminLastName,
          email: d.adminEmail,
          phone: d.adminPhone,
        },
      }),
    onSuccess: () => {
      toast.success('Tenant created. IRB Admin credentials sent to their email.')
      setCreateModalOpen(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ['system-tenants'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to create tenant.')
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      tenantsApi.updateTenant(id, { isActive }),
    onSuccess: (_, { isActive }) => {
      toast.success(isActive ? 'Tenant activated.' : 'Tenant deactivated.')
      queryClient.invalidateQueries({ queryKey: ['system-tenants'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to update tenant.')
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tenants</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage IRB institutions registered on the platform</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateModalOpen(true)}>
          Add Tenant
        </Button>
      </div>

      <Card shadow="sm">
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading tenants..." />
          ) : isError ? (
            <EmptyState title="Failed to load" description="Please refresh." />
          ) : !tenants?.length ? (
            <EmptyState
              icon={<Building2 className="h-8 w-8 text-slate-400" />}
              title="No tenants"
              description="Add the first institution tenant to get started."
              action={
                <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateModalOpen(true)}>
                  Add Tenant
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Institution</TableHeader>
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
                      <div className="flex items-center gap-3">
                        {tenant.logoUrl ? (
                          <img
                            src={tenant.logoUrl}
                            alt={tenant.name}
                            className="h-8 w-8 rounded-lg object-contain border border-slate-200"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rnec-navy/10">
                            <Building2 className="h-4 w-4 text-rnec-navy" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-slate-900">{tenant.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-slate-700">{tenant.code}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600">{tenant.type.replace(/_/g, ' ')}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          tenant.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        {tenant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={
                          tenant.isActive ? (
                            <ToggleRight className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="h-3.5 w-3.5 text-slate-400" />
                          )
                        }
                        loading={toggleActiveMutation.isPending}
                        onClick={() =>
                          toggleActiveMutation.mutate({ id: tenant.id, isActive: !tenant.isActive })
                        }
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
        open={createModalOpen}
        onOpenChange={(open) => { if (!open) { setCreateModalOpen(false); reset() } }}
        title="Add New Tenant"
        description="Register a new IRB institution. The admin will receive login credentials by email."
        size="lg"
      >
        <form
          onSubmit={handleSubmit((d) => createMutation.mutate(d))}
          noValidate
          className="space-y-5"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Institution Details</p>
            <div className="space-y-4">
              <Input
                label="Institution Name"
                required
                placeholder="e.g. University of Rwanda"
                error={errors.name?.message}
                {...register('name')}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Institution Code"
                  required
                  placeholder="e.g. UR-IRB"
                  helperText="Unique identifier (max 12 chars)"
                  error={errors.code?.message}
                  {...register('code')}
                />
                <Select
                  label="Institution Type"
                  required
                  options={[{ value: '', label: 'Select type...' }, ...tenantTypeOptions]}
                  error={errors.type?.message}
                  {...register('type')}
                />
              </div>
              <Input
                label="Logo URL (optional)"
                type="url"
                placeholder="https://institution.ac.rw/logo.png"
                error={errors.logoUrl?.message}
                {...register('logoUrl')}
              />
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
            <Button variant="outline" type="button" onClick={() => { setCreateModalOpen(false); reset() }}>
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
