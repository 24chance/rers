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

// Step schemas
const step1Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
})

const step2Schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const step3Schema = z.object({
  role: z.enum(['APPLICANT', 'REVIEWER']),
  tenantCode: z.string().optional(),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>

const steps = ['Account', 'Password', 'Role']

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Accumulated form data
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null)

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema), defaultValues: step1Data ?? {} })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })
  const form3 = useForm<Step3Data>({ resolver: zodResolver(step3Schema), defaultValues: { role: 'APPLICANT' } })

  const handleStep1 = async (data: Step1Data) => {
    setStep1Data(data)
    setCurrentStep(1)
  }

  const handleStep2 = async (data: Step2Data) => {
    setStep2Data(data)
    setCurrentStep(2)
  }

  const handleStep3 = async (data: Step3Data) => {
    if (!step1Data || !step2Data) return
    try {
      await authApi.register({
        firstName: step1Data.firstName,
        lastName: step1Data.lastName,
        email: step1Data.email,
        phone: step1Data.phone,
        password: step2Data.password,
        tenantCode: data.tenantCode,
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
            <Button type="submit" variant="primary" size="lg" className="flex-1" rightIcon={<ChevronRight className="h-4 w-4" />}>
              Continue
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: Role */}
      {currentStep === 2 && (
        <form onSubmit={form3.handleSubmit(handleStep3)} noValidate className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">Select your role</p>
            <div className="space-y-3">
              {[
                {
                  value: 'APPLICANT' as const,
                  label: 'Research Applicant',
                  description: 'Submit and manage research ethics applications',
                },
                {
                  value: 'REVIEWER' as const,
                  label: 'External Reviewer',
                  description: 'Review assigned research applications (requires admin approval)',
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={clsx(
                    'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors',
                    form3.watch('role') === option.value
                      ? 'border-rnec-teal bg-rnec-teal/5'
                      : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <input
                    type="radio"
                    value={option.value}
                    className="mt-0.5 accent-rnec-teal"
                    {...form3.register('role')}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{option.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Input
            label="Institution code (optional)"
            placeholder="e.g. KIGALI-IRB"
            helperText="Enter your institution's code if provided by an administrator"
            error={form3.formState.errors.tenantCode?.message}
            {...form3.register('tenantCode')}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" size="lg" className="flex-1" leftIcon={<ChevronLeft className="h-4 w-4" />} onClick={() => setCurrentStep(1)}>
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
              loading={form3.formState.isSubmitting}
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
