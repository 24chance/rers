'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormData = z.infer<typeof schema>

const roleRedirectMap: Record<UserRole, string> = {
  APPLICANT: '/applicant/dashboard',
  REVIEWER: '/reviewer/dashboard',
  IRB_ADMIN: '/irb-admin/dashboard',
  RNEC_ADMIN: '/rnec-admin/dashboard',
  FINANCE_OFFICER: '/finance/dashboard',
  CHAIRPERSON: '/chairperson/dashboard',
  SYSTEM_ADMIN: '/system-admin/dashboard',
}

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      const result = await authApi.login(data.email, data.password)
      setAuth(result.user, result.accessToken)
      toast.success(`Welcome back, ${result.user.firstName}!`)
      const destination = roleRedirectMap[result.user.role] ?? '/applicant/dashboard'
      router.push(destination)
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? 'Invalid email or password. Please try again.'
      toast.error(message)
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-slate-500 text-sm mt-1">Sign in to your RNEC account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          error={errors.password?.message}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-rnec-teal hover:text-rnec-navy font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-rnec-teal hover:text-rnec-navy font-medium transition-colors"
        >
          Register
        </Link>
      </p>
    </>
  )
}
