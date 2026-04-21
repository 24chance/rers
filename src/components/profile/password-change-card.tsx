'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/store/auth.store'

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export function PasswordChangeCard() {
  const updateUser = useAuthStore((s) => s.updateUser)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword)
      updateUser({ firstLogin: false })
      toast.success('Password changed successfully.')
      reset()
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to change password.')
    }
  }

  return (
    <Card shadow="sm">
      <CardHeader>
        <h2 className="text-sm font-semibold text-slate-900">Change Password</h2>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardBody className="space-y-4">
          <Input
            label="Current password"
            type={showCurrent ? 'text' : 'password'}
            required
            placeholder="••••••••"
            error={errors.currentPassword?.message}
            rightElement={
              <button type="button" onClick={() => setShowCurrent((v) => !v)} className="text-slate-400 hover:text-slate-600">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register('currentPassword')}
          />
          <Input
            label="New password"
            type={showNew ? 'text' : 'password'}
            required
            placeholder="••••••••"
            error={errors.newPassword?.message}
            rightElement={
              <button type="button" onClick={() => setShowNew((v) => !v)} className="text-slate-400 hover:text-slate-600">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register('newPassword')}
          />
          <Input
            label="Confirm new password"
            type={showConfirm ? 'text' : 'password'}
            required
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            rightElement={
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register('confirmPassword')}
          />
        </CardBody>
        <CardFooter>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Update Password
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
