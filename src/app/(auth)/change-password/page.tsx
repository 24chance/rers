'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types'

const roleRedirectMap: Record<UserRole, string> = {
  APPLICANT: '/applicant/dashboard',
  REVIEWER: '/reviewer/dashboard',
  IRB_ADMIN: '/irb-admin/dashboard',
  RNEC_ADMIN: '/rnec-admin/dashboard',
  FINANCE_OFFICER: '/finance/dashboard',
  CHAIRPERSON: '/chairperson/dashboard',
  SYSTEM_ADMIN: '/system-admin/dashboard',
}

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user, updateUser } = useAuthStore()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const redirectToDashboard = () => {
    const destination = roleRedirectMap[user?.role as UserRole] ?? '/applicant/dashboard'
    router.push(destination)
  }

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword)
      updateUser({ firstLogin: false })
      toast.success('Password changed successfully. Welcome!')
      redirectToDashboard()
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to change password.')
    }
  }

  const handleSkip = async () => {
    try {
      await authApi.skipFirstLogin()
      updateUser({ firstLogin: false })
      redirectToDashboard()
    } catch {
      // skip silently — still navigate
      updateUser({ firstLogin: false })
      redirectToDashboard()
    }
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rnec-navy/10">
            <ShieldCheck className="h-5 w-5 text-rnec-navy" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set Your Password</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Your account was created with a temporary password. Please set a new one to keep your account secure.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input
          label="Current (temporary) password"
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

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={isSubmitting}>
          Set Password & Continue
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          Skip for now (not recommended)
        </button>
      </div>
    </>
  )
}
