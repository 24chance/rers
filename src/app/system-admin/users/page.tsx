'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Users } from 'lucide-react'
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
import { UserRole } from '@/types'
import { format } from 'date-fns'
import { clsx } from 'clsx'

const roleOptions = [
  { value: '', label: 'All roles' },
  ...Object.values(UserRole).map((r) => ({ value: r, label: r.replace(/_/g, ' ') })),
]

export default function SystemUsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [roleModalUser, setRoleModalUser] = useState<{ id: string; name: string } | null>(null)
  const [newRole, setNewRole] = useState<UserRole>(UserRole.APPLICANT)

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

  const updateRoleMutation = useMutation({
    mutationFn: () => usersApi.updateRole(roleModalUser!.id, newRole),
    onSuccess: () => {
      toast.success('Role updated successfully.')
      setRoleModalUser(null)
      queryClient.invalidateQueries({ queryKey: ['system-users'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to update role.')
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage all platform users and their roles</p>
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
                    <TableHeader>Verified</TableHeader>
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
                            user.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
                          )}
                        >
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
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
                            setRoleModalUser({ id: user.id, name: `${user.firstName} ${user.lastName}` })
                            setNewRole(user.role)
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

      {/* Change role modal */}
      <Modal
        open={!!roleModalUser}
        onOpenChange={(open) => !open && setRoleModalUser(null)}
        title="Change User Role"
        description={roleModalUser ? `Update role for ${roleModalUser.name}` : undefined}
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="New Role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as UserRole)}
            options={Object.values(UserRole).map((r) => ({ value: r, label: r.replace(/_/g, ' ') }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRoleModalUser(null)}>Cancel</Button>
            <Button
              variant="primary"
              loading={updateRoleMutation.isPending}
              onClick={() => updateRoleMutation.mutate()}
            >
              Update Role
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
