'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { authApi } from '@/lib/api/auth.api'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error('Invalid or missing reset token.')
      return
    }
    try {
      await authApi.resetPassword(token, data.password)
      toast.success('Password reset successfully! Please sign in.')
      router.push('/login')
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Reset failed. The link may be expired.')
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter a new password for your account.
        </p>
      </div>

      {!token && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Invalid or missing reset token. Please request a new password reset link.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input
          label="New password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          required
          helperText="Minimum 8 characters"
          error={errors.password?.message}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register('password')}
        />

        <Input
          label="Confirm new password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="••••••••"
          required
          error={errors.confirmPassword?.message}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="text-slate-400 hover:text-slate-600"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          disabled={!token}
        >
          Reset password
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-rnec-teal hover:text-rnec-navy font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-500 text-sm py-8">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
