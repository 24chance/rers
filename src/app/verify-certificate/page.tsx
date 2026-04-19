'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, CheckCircle, XCircle, Award, Calendar, Building2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { registryApi } from '@/lib/api/registry.api'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import type { Certificate } from '@/types'

const schema = z.object({
  token: z.string().min(1, 'Please enter a certificate number or verification token'),
})

type FormData = z.infer<typeof schema>

type VerifyResult = (Certificate & { applicationTitle: string; isValid: boolean }) | null
type VerifyError = string | null

export default function VerifyCertificatePage() {
  const [result, setResult] = useState<VerifyResult>(null)
  const [error, setError] = useState<VerifyError>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setResult(null)
    setError(null)
    try {
      const cert = await registryApi.verifyCertificate(data.token)
      setResult(cert)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      if ((err as { statusCode?: number })?.statusCode === 404) {
        setError('Certificate not found. Please check the token and try again.')
      } else {
        setError(msg ?? 'Verification failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-rnec-navy py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rnec-gold/20">
              <Award className="h-7 w-7 text-rnec-gold" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Certificate Verification</h1>
          <p className="text-white/70 mt-2 text-sm">
            Verify the authenticity of an RNEC research ethics approval certificate
          </p>
        </div>
      </div>

      {/* Search form */}
      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <Card shadow="md">
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter certificate number or verification token..."
                    error={errors.token?.message}
                    {...register('token')}
                  />
                </div>
                <Button type="submit" variant="primary" size="md" loading={isLoading} leftIcon={<Search className="h-4 w-4" />}>
                  Verify
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="mt-8">
            <Loader centered label="Verifying certificate..." />
          </div>
        )}

        {/* Error: not found */}
        {error && !isLoading && (
          <Card shadow="sm" className="mt-6 border-red-200">
            <CardBody>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-red-700">Certificate Not Found</h2>
                  <p className="text-sm text-slate-600 mt-1">{error}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Success: found */}
        {result && !isLoading && (
          <Card
            shadow="md"
            className={clsx('mt-6', result.isValid ? 'border-emerald-200' : 'border-orange-200')}
          >
            <CardBody>
              <div className="flex items-start gap-4 mb-6">
                <div
                  className={clsx(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                    result.isValid ? 'bg-emerald-100' : 'bg-orange-100',
                  )}
                >
                  {result.isValid ? (
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-orange-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">Certificate Verified</h2>
                    <span
                      className={clsx(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        result.isValid
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-orange-100 text-orange-700',
                      )}
                    >
                      {result.isValid ? 'VALID' : 'EXPIRED'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    This certificate record was found in the RNEC registry.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem
                  icon={<Award className="h-4 w-4" />}
                  label="Certificate Number"
                  value={result.certificateNumber}
                />
                <DetailItem
                  icon={<User className="h-4 w-4" />}
                  label="Study Title"
                  value={result.applicationTitle}
                />
                <DetailItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Issued Date"
                  value={format(new Date(result.issuedAt), 'dd MMM yyyy')}
                />
                {result.expiresAt && (
                  <DetailItem
                    icon={<Calendar className="h-4 w-4" />}
                    label="Expiry Date"
                    value={format(new Date(result.expiresAt), 'dd MMM yyyy')}
                  />
                )}
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
                Verification token: <span className="font-mono text-slate-700">{result.verificationToken}</span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Instructions */}
        {!result && !error && !isLoading && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Enter the certificate number or unique verification token printed on the certificate document.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}
