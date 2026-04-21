'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { toast } from '@/components/ui/toast'
import { usersApi } from '@/lib/api/users.api'
import { useAuthStore } from '@/store/auth.store'
import { PasswordChangeCard } from '@/components/profile/password-change-card'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function RnecAdminProfilePage() {
  const { user, updateUser } = useAuthStore()

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => usersApi.updateUser(user!.id, data),
    onSuccess: (updated) => { updateUser(updated); toast.success('Profile updated.') },
    onError: (err: unknown) => { toast.error((err as { message?: string })?.message ?? 'Update failed.') },
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account information</p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar firstName={user?.firstName} lastName={user?.lastName} size="lg" />
            <div>
              <p className="font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="inline-flex mt-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                RNEC Admin
              </span>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First name" required error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last name" required error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="Email address" type="email" value={user?.email ?? ''} disabled helperText="Email cannot be changed." />
            <Input label="Phone number" type="tel" placeholder="+250 700 000 000" {...register('phone')} />
          </CardBody>
          <CardFooter>
            <div className="flex justify-end">
              <Button type="submit" variant="primary" loading={mutation.isPending} disabled={!isDirty}>
                Save Changes
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>

      <PasswordChangeCard />
    </div>
  )
}
