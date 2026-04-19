'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, UserCog } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { toast } from '@/components/ui/toast'
import { usersApi } from '@/lib/api/users.api'
import { tenantsApi } from '@/lib/api/tenants.api'
import { UserRole } from '@/types'
import { format } from 'date-fns'

const roleOptions = [
  { value: '', label: 'All roles' },
  ...Object.values(UserRole).map((r) => ({ value: r, label: r.replace(/_/g, ' ') })),
]

const roleSelectOptions = Object.values(UserRole).map((r) => ({ value: r, label: r.replace(/_/g, ' ') }))

const roleSchema = z.object({
  role: z.nativeEnum(UserRole),
})

type RoleFormData = z.infer<typeof roleSchema>

export default function RnecUsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [role, setRole] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    clearTimeout((window as unknown as { _st?: ReturnType<typeof setTimeout> })._st)
    ;(window as unknown as { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(() => {
      setDebouncedSearch(e.target.value)
      setPage(1)
    }, 400)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['rnec-users', { search: debouncedSearch, role, tenantId, page }],
    queryFn: () =>
      usersApi.getUsers({
        search: debouncedSearch || undefined,
        role: role as UserRole || undefined,
        tenantId: tenantId || undefined,
        page,
        limit: 20,
      }),
  })

  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantsApi.getTenants,
  })

  const tenantOptions = [
    { value: '', label: 'All institutions' },
    ...(tenants?.map((t) => ({ value: t.id, label: t.name })) ?? []),
  ]

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersApi.updateRole(id, role),
    onSuccess: () => {
      toast.success('User role updated successfully.')
      setRoleModalOpen(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ['rnec-users'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to update role.')
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Users</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage all users across all institutions nationally</p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={handleSearch}
                leftElement={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex gap-2">
              <Select
                options={tenantOptions}
                value={tenantId}
                onChange={(e) => { setTenantId(e.target.value); setPage(1) }}
                className="min-w-[180px]"
              />
              <Select
                options={roleOptions}
                value={role}
                onChange={(e) => { setRole(e.target.value); setPage(1) }}
                className="min-w-[150px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading users..." />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<UserCog className="h-8 w-8 text-slate-400" />}
              title="No users found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Role</TableHeader>
                    <TableHeader>Institution</TableHeader>
                    <TableHeader>Verified</TableHeader>
                    <TableHeader>Joined</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {data.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <span className="text-sm font-medium text-slate-900">
                          {user.firstName} {user.lastName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">{user.email}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {user.role.replace(/_/g, ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-slate-500">
                          {tenants?.find((t) => t.id === user.tenantId)?.name ?? user.tenantId}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.isVerified ? (
                          <span className="text-xs text-emerald-600 font-medium">Verified</span>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">Unverified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">
                          {format(new Date(user.createdAt), 'dd MMM yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUserId(user.id)
                            setRoleModalOpen(true)
                          }}
                        >
                          Change Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.meta && (
                <div className="px-4">
                  <Pagination meta={data.meta} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <Modal
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
        title="Change User Role"
        description="Update this user's role across the system."
      >
        <form
          onSubmit={handleSubmit((d) => {
            if (selectedUserId) {
              updateRoleMutation.mutate({ id: selectedUserId, role: d.role })
            }
          })}
          noValidate
          className="space-y-4"
        >
          <Select
            label="New Role"
            required
            options={roleSelectOptions}
            error={errors.role?.message}
            {...register('role')}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={updateRoleMutation.isPending}>
              Update Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
