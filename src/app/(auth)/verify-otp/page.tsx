'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { authApi } from '@/lib/api/auth.api'
import { clsx } from 'clsx'
import { Mail } from 'lucide-react'

function VerifyOtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleChange = useCallback(
    (index: number, value: string) => {
      const char = value.replace(/\D/g, '').slice(-1)
      const next = [...digits]
      next[index] = char
      setDigits(next)
      if (char && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [digits],
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    },
    [digits],
  )

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = Array(6).fill('')
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i]
    }
    setDigits(next)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerify = async () => {
    const otp = digits.join('')
    if (otp.length !== 6) {
      toast.error('Please enter all 6 digits')
      return
    }
    setIsSubmitting(true)
    try {
      await authApi.verifyOtp(email, otp)
      toast.success('Email verified! You can now sign in.')
      router.push('/login')
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Invalid or expired OTP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await authApi.forgotPassword(email) // reuse forgot-password to resend OTP via same endpoint pattern
      toast.info('A new OTP has been sent to your email.')
      setCooldown(60)
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Could not resend OTP. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rnec-teal/10">
          <Mail className="h-7 w-7 text-rnec-teal" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
        <p className="text-slate-500 text-sm mt-2">
          We&apos;ve sent a 6-digit code to
        </p>
        <p className="text-slate-900 font-medium text-sm">{email}</p>
      </div>

      <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={clsx(
              'h-12 w-10 rounded-lg border-2 text-center text-lg font-bold',
              'focus:outline-none focus:border-rnec-teal',
              'transition-colors',
              digit ? 'border-rnec-teal bg-rnec-teal/5 text-rnec-navy' : 'border-slate-300 text-slate-900',
            )}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        loading={isSubmitting}
        onClick={handleVerify}
      >
        Verify Email
      </Button>

      <div className="text-center mt-4">
        {cooldown > 0 ? (
          <p className="text-sm text-slate-500">
            Resend in <span className="font-medium text-slate-900">{cooldown}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-sm text-rnec-teal hover:text-rnec-navy font-medium transition-colors disabled:opacity-50"
          >
            {isResending ? 'Resending...' : 'Resend OTP'}
          </button>
        )}
      </div>
    </>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-500 text-sm py-8">Loading...</div>}>
      <VerifyOtpForm />
    </Suspense>
  )
}
