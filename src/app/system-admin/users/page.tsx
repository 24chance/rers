'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Users, UserPlus, Pencil, UserX } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { Modal } from '@/components/ui/modal'
import { Avatar } from '@/components/ui/avatar'
import { toast } from '@/components/ui/toast'
import { usersApi } from '@/lib/api/users.api'
import { UserRole, type User } from '@/types'
import { format } from 'date-fns'
import { clsx } from 'clsx'

const roleOptions = [
  { value: '', label: 'All roles' },
  ...Object.values(UserRole).map((r) => ({ value: r, label: r.replace(/_/g, ' ') })),
]

const createAdminSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
})

const editUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
})

type CreateAdminFormData = z.infer<typeof createAdminSchema>
type EditUserFormData = z.infer<typeof editUserSchema>

export default function SystemUsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deactivateUser, setDeactivateUser] = useState<User | null>(null)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    clearTimeout((window as unknown as { _ut?: ReturnType<typeof setTimeout> })._ut)
    ;(window as unknown as { _ut?: ReturnType<typeof setTimeout> })._ut = setTimeout(() => {
      setDebouncedSearch(e.target.value)
      setPage(1)
    }, 400)
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['system-users', { search: debouncedSearch, role: roleFilter, page }],
    queryFn: () =>
      usersApi.getUsers({
        search: debouncedSearch || undefined,
        role: roleFilter as UserRole || undefined,
        page,
        limit: 20,
      }),
  })


  const createForm = useForm<CreateAdminFormData>({ resolver: zodResolver(createAdminSchema) })
  const editForm = useForm<EditUserFormData>({ resolver: zodResolver(editUserSchema) })

  const createMutation = useMutation({
    mutationFn: (d: CreateAdminFormData) =>
      usersApi.createUser({ firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone, role: UserRole.RNEC_ADMIN }),
    onSuccess: () => {
      toast.success('RNEC Admin created. Login credentials sent to their email.')
      setCreateModalOpen(false)
      createForm.reset()
      queryClient.invalidateQueries({ queryKey: ['system-users'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to create admin.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (d: EditUserFormData) =>
      usersApi.updateUser(editUser!.id, { firstName: d.firstName, lastName: d.lastName, phone: d.phone }),
    onSuccess: () => {
      toast.success('User updated.')
      setEditUser(null)
      queryClient.invalidateQueries({ queryKey: ['system-users'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to update user.')
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.deactivateUser(id),
    onSuccess: () => {
      toast.success('User deactivated.')
      setDeactivateUser(null)
      queryClient.invalidateQueries({ queryKey: ['system-users'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to deactivate user.')
    },
  })

  const openEdit = (user: User) => {
    setEditUser(user)
    editForm.reset({ firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage all platform users</p>
        </div>
        <Button variant="primary" leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setCreateModalOpen(true)}>
          Create RNEC Admin
        </Button>
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
            <Select
              options={roleOptions}
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              className="min-w-[160px]"
            />
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading users..." />
          ) : isError ? (
            <EmptyState title="Failed to load" description="Please refresh." />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<Users className="h-8 w-8 text-slate-400" />}
              title="No users found"
              description="Try adjusting your filters."
            />
          ) : (
            <>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>User</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Role</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Joined</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {data.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
                          <span className="text-sm font-medium text-slate-900">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">{user.email}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {user.role.replace(/_/g, ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={clsx(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                            user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600',
                          )}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">
                          {format(new Date(user.createdAt), 'dd MMM yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" leftIcon={<Pencil className="h-3.5 w-3.5" />} onClick={() => openEdit(user)}>
                            Edit
                          </Button>
                          {user.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<UserX className="h-3.5 w-3.5 text-red-500" />}
                              onClick={() => setDeactivateUser(user)}
                            >
                              <span className="text-red-500">Deactivate</span>
                            </Button>
                          )}
                        </div>
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

      {/* Create RNEC Admin Modal */}
      <Modal
        open={createModalOpen}
        onOpenChange={(open) => { if (!open) { setCreateModalOpen(false); createForm.reset() } }}
        title="Create RNEC Admin"
        description="A temporary password will be emailed to the new admin."
        size="md"
      >
        <form onSubmit={createForm.handleSubmit((d) => createMutation.mutate(d))} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              required
              placeholder="Alice"
              error={createForm.formState.errors.firstName?.message}
              {...createForm.register('firstName')}
            />
            <Input
              label="Last name"
              required
              placeholder="Nkusi"
              error={createForm.formState.errors.lastName?.message}
              {...createForm.register('lastName')}
            />
          </div>
          <Input
            label="Email address"
            type="email"
            required
            placeholder="admin@rnec.rw"
            error={createForm.formState.errors.email?.message}
            {...createForm.register('email')}
          />
          <Input
            label="Phone number"
            type="tel"
            placeholder="+250 700 000 000"
            error={createForm.formState.errors.phone?.message}
            {...createForm.register('phone')}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setCreateModalOpen(false); createForm.reset() }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={createForm.formState.isSubmitting || createMutation.isPending}>
              Create Admin
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={!!editUser}
        onOpenChange={(open) => { if (!open) setEditUser(null) }}
        title="Edit User"
        description="Update user profile information."
        size="sm"
      >
        <form onSubmit={editForm.handleSubmit((d) => updateMutation.mutate(d))} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              required
              error={editForm.formState.errors.firstName?.message}
              {...editForm.register('firstName')}
            />
            <Input
              label="Last name"
              required
              error={editForm.formState.errors.lastName?.message}
              {...editForm.register('lastName')}
            />
          </div>
          <Input
            label="Phone number"
            type="tel"
            placeholder="+250 700 000 000"
            error={editForm.formState.errors.phone?.message}
            {...editForm.register('phone')}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={editForm.formState.isSubmitting || updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal
        open={!!deactivateUser}
        onOpenChange={(open) => { if (!open) setDeactivateUser(null) }}
        title="Deactivate User"
        size="sm"
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to deactivate{' '}
          <span className="font-medium text-slate-900">
            {deactivateUser?.firstName} {deactivateUser?.lastName}
          </span>
          ? They will no longer be able to log in.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeactivateUser(null)}>Cancel</Button>
          <Button
            variant="danger"
            loading={deactivateMutation.isPending}
            onClick={() => deactivateUser && deactivateMutation.mutate(deactivateUser.id)}
          >
            Deactivate
          </Button>
        </div>
      </Modal>
    </div>
  )
}
