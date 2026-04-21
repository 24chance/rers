'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { authApi } from '@/lib/api/auth.api'
import { clsx } from 'clsx'

const step1Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
})

const step2Schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

const steps = ['Account', 'Password']

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema), defaultValues: step1Data ?? {} })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })

  const handleStep1 = (data: Step1Data) => {
    setStep1Data(data)
    setCurrentStep(1)
  }

  const handleStep2 = async (data: Step2Data) => {
    if (!step1Data) return
    try {
      await authApi.register({
        firstName: step1Data.firstName,
        lastName: step1Data.lastName,
        email: step1Data.email,
        phone: step1Data.phone,
        password: data.password,
      })
      toast.success('Account created! Please verify your email.')
      router.push(`/verify-otp?email=${encodeURIComponent(step1Data.email)}`)
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Registration failed. Please try again.')
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="text-slate-500 text-sm mt-1">Join RNEC to submit and manage research applications</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={clsx(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                index < currentStep
                  ? 'bg-rnec-teal text-white'
                  : index === currentStep
                    ? 'bg-rnec-navy text-white'
                    : 'bg-slate-100 text-slate-400',
              )}
            >
              {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span
              className={clsx(
                'ml-2 text-sm font-medium hidden sm:block',
                index === currentStep ? 'text-slate-900' : 'text-slate-400',
              )}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div
                className={clsx(
                  'mx-3 h-0.5 w-8 sm:w-12 transition-colors',
                  index < currentStep ? 'bg-rnec-teal' : 'bg-slate-200',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Account */}
      {currentStep === 0 && (
        <form onSubmit={form1.handleSubmit(handleStep1)} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              required
              placeholder="John"
              error={form1.formState.errors.firstName?.message}
              {...form1.register('firstName')}
            />
            <Input
              label="Last name"
              required
              placeholder="Doe"
              error={form1.formState.errors.lastName?.message}
              {...form1.register('lastName')}
            />
          </div>
          <Input
            label="Email address"
            type="email"
            required
            placeholder="you@example.com"
            error={form1.formState.errors.email?.message}
            {...form1.register('email')}
          />
          <Input
            label="Phone number"
            type="tel"
            placeholder="+250 700 000 000"
            error={form1.formState.errors.phone?.message}
            {...form1.register('phone')}
          />
          <Button type="submit" variant="primary" size="lg" className="w-full" rightIcon={<ChevronRight className="h-4 w-4" />}>
            Continue
          </Button>
        </form>
      )}

      {/* Step 2: Password */}
      {currentStep === 1 && (
        <form onSubmit={form2.handleSubmit(handleStep2)} noValidate className="space-y-4">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            helperText="Minimum 8 characters"
            error={form2.formState.errors.password?.message}
            rightElement={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...form2.register('password')}
          />
          <Input
            label="Confirm password"
            type={showConfirm ? 'text' : 'password'}
            required
            placeholder="••••••••"
            error={form2.formState.errors.confirmPassword?.message}
            rightElement={
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...form2.register('confirmPassword')}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" size="lg" className="flex-1" leftIcon={<ChevronLeft className="h-4 w-4" />} onClick={() => setCurrentStep(0)}>
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
              loading={form2.formState.isSubmitting}
            >
              Create Account
            </Button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-rnec-teal hover:text-rnec-navy font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </>
  )
}
