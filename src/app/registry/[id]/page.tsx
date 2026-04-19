'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Calendar, Building2, User, Award, Hash } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { Button } from '@/components/ui/button'
import { registryApi } from '@/lib/api/registry.api'
import { format } from 'date-fns'

interface Props {
  params: Promise<{ id: string }>
}

export default function RegistryDetailPage({ params }: Props) {
  const { id } = use(params)

  const { data: entry, isLoading, isError } = useQuery({
    queryKey: ['registry', id],
    queryFn: () => registryApi.getRegistryEntry(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader size="lg" label="Loading study details..." />
      </div>
    )
  }

  if (isError || !entry) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-4">Study not found or failed to load.</p>
          <Link href="/registry">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>Back to Registry</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-rnec-navy py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/registry" className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Registry
          </Link>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rnec-gold/20">
              <BookOpen className="h-6 w-6 text-rnec-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{entry.title}</h1>
              <p className="text-white/60 text-sm mt-1">Reference: {entry.referenceNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status badge */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            {entry.status}
          </span>
          {entry.certificateNumber && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              <Award className="h-3.5 w-3.5" />
              Cert. {entry.certificateNumber}
            </span>
          )}
        </div>

        {/* Study details */}
        <Card shadow="sm">
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-900">Study Details</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FieldItem icon={<Hash className="h-4 w-4" />} label="Reference Number" value={entry.referenceNumber} />
              <FieldItem icon={<User className="h-4 w-4" />} label="Principal Investigator" value={entry.applicantName} />
              <FieldItem icon={<Building2 className="h-4 w-4" />} label="Institution" value={entry.institutionName} />
              <FieldItem
                icon={<Calendar className="h-4 w-4" />}
                label="Approval Date"
                value={entry.approvalDate ? format(new Date(entry.approvalDate), 'dd MMMM yyyy') : '—'}
              />
              {entry.expiryDate && (
                <FieldItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Expiry Date"
                  value={format(new Date(entry.expiryDate), 'dd MMMM yyyy')}
                />
              )}
              {entry.certificateNumber && (
                <FieldItem icon={<Award className="h-4 w-4" />} label="Certificate Number" value={entry.certificateNumber} />
              )}
            </div>
          </CardBody>
        </Card>

        {/* Verify certificate CTA */}
        <div className="rounded-xl border border-rnec-gold/30 bg-rnec-gold/5 px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Verify this certificate</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm the authenticity of the approval certificate for this study.
            </p>
          </div>
          <Link href={`/verify-certificate`}>
            <Button variant="navy" size="sm">
              Verify Certificate
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function FieldItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400 shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  )
}
