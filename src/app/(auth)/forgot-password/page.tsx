'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { CheckCircle, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { authApi } from '@/lib/api/auth.api'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [isResending, setIsResending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.forgotPassword(data.email)
      setSubmittedEmail(data.email)
      setSubmitted(true)
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Could not process your request. Please try again.')
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await authApi.forgotPassword(submittedEmail)
      toast.success('Reset email resent.')
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Could not resend email.')
    } finally {
      setIsResending(false)
    }
  }

  if (submitted) {
    return (
      <>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle className="h-7 w-7 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
          <p className="text-slate-500 text-sm mt-2">
            We&apos;ve sent a password reset link to
          </p>
          <p className="text-slate-900 font-medium text-sm mt-1">{submittedEmail}</p>
          <p className="text-slate-500 text-sm mt-3">
            Didn&apos;t receive the email? Check your spam folder or resend.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            loading={isResending}
            onClick={handleResend}
          >
            Resend email
          </Button>
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

  return (
    <>
      <div className="mb-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rnec-teal/10">
          <Mail className="h-7 w-7 text-rnec-teal" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          Send reset link
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
