'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, UserPlus } from 'lucide-react'
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
import { UserRole } from '@/types'
import { format } from 'date-fns'
import { clsx } from 'clsx'

const roleFilterOptions = [
  { value: '', label: 'All roles' },
  { value: UserRole.REVIEWER, label: 'Reviewer' },
  { value: UserRole.FINANCE_OFFICER, label: 'Finance Officer' },
  { value: UserRole.CHAIRPERSON, label: 'Chairperson' },
]

const creatableRoleOptions = [
  { value: UserRole.REVIEWER, label: 'Reviewer' },
  { value: UserRole.FINANCE_OFFICER, label: 'Finance Officer' },
  { value: UserRole.CHAIRPERSON, label: 'Chairperson' },
]

const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  role: z.enum([UserRole.REVIEWER, UserRole.FINANCE_OFFICER, UserRole.CHAIRPERSON]),
})

type CreateUserFormData = z.infer<typeof createUserSchema>

export default function IrbUsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    clearTimeout((window as unknown as { _st?: ReturnType<typeof setTimeout> })._st)
    ;(window as unknown as { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(() => {
      setDebouncedSearch(e.target.value)
      setPage(1)
    }, 400)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['irb-users', { search: debouncedSearch, role: roleFilter, page }],
    queryFn: () =>
      usersApi.getUsers({
        search: debouncedSearch || undefined,
        role: roleFilter as UserRole || undefined,
        page,
        limit: 20,
      }),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: UserRole.REVIEWER },
  })

  const createMutation = useMutation({
    mutationFn: (d: CreateUserFormData) =>
      usersApi.createUser({ firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone, role: d.role }),
    onSuccess: () => {
      toast.success('User created. Login credentials sent to their email.')
      setCreateModalOpen(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ['irb-users'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to create user.')
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage users within your institution</p>
        </div>
        <Button variant="primary" leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setCreateModalOpen(true)}>
          Create User
        </Button>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input placeholder="Search by name or email..." value={search} onChange={handleSearch} leftElement={<Search className="h-4 w-4" />} />
            </div>
            <Select options={roleFilterOptions} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }} className="min-w-[160px]" />
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading users..." />
          ) : !data?.data.data.length ? (
            <EmptyState icon={<UserPlus className="h-8 w-8 text-slate-400" />} title="No users found" description="Create the first user for your institution."
              action={<Button variant="primary" leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setCreateModalOpen(true)}>Create User</Button>}
            />
          ) : (
            <>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Role</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Joined</TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {data.data.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell><span className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</span></TableCell>
                      <TableCell><span className="text-sm text-slate-600">{user.email}</span></TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {user.role.name.replace(/_/g, ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={clsx('text-xs font-medium', user.isActive ? 'text-emerald-600' : 'text-red-500')}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell><span className="text-xs text-slate-500">{format(new Date(user.createdAt), 'dd MMM yyyy')}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.meta && <div className="px-4"><Pagination meta={data.meta} onPageChange={setPage} /></div>}
            </>
          )}
        </CardBody>
      </Card>

      <Modal open={createModalOpen} onOpenChange={(open) => { if (!open) { setCreateModalOpen(false); reset() } }}
        title="Create User" description="Add a new user. A temporary password will be emailed to them." size="md">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" required placeholder="John" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last name" required placeholder="Doe" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <Input label="Email address" type="email" required placeholder="user@institution.ac.rw" error={errors.email?.message} {...register('email')} />
          <Input label="Phone number" type="tel" placeholder="+250 700 000 000" error={errors.phone?.message} {...register('phone')} />
          <Select label="Role" required options={creatableRoleOptions} error={errors.role?.message} {...register('role')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setCreateModalOpen(false); reset() }}>Cancel</Button>
            <Button variant="primary" type="submit" loading={isSubmitting || createMutation.isPending}>Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
