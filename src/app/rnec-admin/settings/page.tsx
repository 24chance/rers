'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Globe } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/api/client'

interface RnecSettings {
  organization: {
    name: string
    acronym: string
    country: string
    website: string
    email: string
    phone: string
    address: string
    missionStatement: string
  }
  policy: {
    maxReviewDays: number
    renewalGracePeriodDays: number
    progressReportFrequencyMonths: number
    certificateValidityMonths: number
  }
  notifications: {
    sendEmailNotifications: boolean
    notifyOnNewApplication: boolean
    notifyOnDecision: boolean
    adminEmail: string
  }
}

async function getRnecSettings(): Promise<RnecSettings> {
  const res = await api.get<RnecSettings>('/settings/rnec')
  return res.data
}

async function saveRnecSettings(dto: RnecSettings): Promise<RnecSettings> {
  const res = await api.patch<RnecSettings>('/settings/rnec', dto)
  return res.data
}

const schema = z.object({
  organization: z.object({
    name: z.string().min(2, 'Name required'),
    acronym: z.string().min(2, 'Acronym required'),
    country: z.string().min(2, 'Country required'),
    website: z.string().url('Valid URL required').or(z.literal('')),
    email: z.string().email('Valid email required'),
    phone: z.string().min(7, 'Phone required'),
    address: z.string().min(5, 'Address required'),
    missionStatement: z.string().min(10, 'Mission statement required'),
  }),
  policy: z.object({
    maxReviewDays: z.coerce.number().min(1).max(180),
    renewalGracePeriodDays: z.coerce.number().min(0).max(90),
    progressReportFrequencyMonths: z.coerce.number().min(1).max(12),
    certificateValidityMonths: z.coerce.number().min(1).max(60),
  }),
  notifications: z.object({
    sendEmailNotifications: z.boolean(),
    notifyOnNewApplication: z.boolean(),
    notifyOnDecision: z.boolean(),
    adminEmail: z.string().email('Valid admin email required'),
  }),
})

type FormData = z.infer<typeof schema>

export default function RnecSettingsPage() {
  const [activeTab, setActiveTab] = useState<'organization' | 'policy' | 'notifications'>('organization')

  const { data: settings, isLoading } = useQuery({
    queryKey: ['rnec-settings'],
    queryFn: getRnecSettings,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    values: settings,
  })

  const mutation = useMutation({
    mutationFn: saveRnecSettings,
    onSuccess: () => {
      toast.success('Settings saved successfully.')
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to save settings.')
    },
  })

  const tabs = [
    { id: 'organization' as const, label: 'Organization' },
    { id: 'policy' as const, label: 'Policy' },
    { id: 'notifications' as const, label: 'Notifications' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">National Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configure RNEC national-level settings and policies</p>
      </div>

      {isLoading ? (
        <Loader centered label="Loading settings..." />
      ) : (
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
          <div className="flex gap-1 border-b border-slate-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? 'border-rnec-teal text-rnec-teal'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'organization' && (
            <Card shadow="sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-500" />
                  <h2 className="text-base font-semibold">Organization Details</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Organization Name"
                    required
                    placeholder="Rwanda National Ethics Committee"
                    error={errors.organization?.name?.message}
                    {...register('organization.name')}
                  />
                  <Input
                    label="Acronym"
                    required
                    placeholder="RNEC"
                    error={errors.organization?.acronym?.message}
                    {...register('organization.acronym')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Country"
                    required
                    placeholder="Rwanda"
                    error={errors.organization?.country?.message}
                    {...register('organization.country')}
                  />
                  <Input
                    label="Website"
                    type="url"
                    placeholder="https://rnec.rw"
                    error={errors.organization?.website?.message}
                    {...register('organization.website')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Official Email"
                    type="email"
                    required
                    placeholder="info@rnec.rw"
                    error={errors.organization?.email?.message}
                    {...register('organization.email')}
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    required
                    placeholder="+250 7XX XXX XXX"
                    error={errors.organization?.phone?.message}
                    {...register('organization.phone')}
                  />
                </div>
                <Input
                  label="Physical Address"
                  required
                  placeholder="Kigali, Rwanda"
                  error={errors.organization?.address?.message}
                  {...register('organization.address')}
                />
                <Textarea
                  label="Mission Statement"
                  required
                  placeholder="Describe the organization's mission..."
                  error={errors.organization?.missionStatement?.message}
                  {...register('organization.missionStatement')}
                />
              </CardBody>
            </Card>
          )}

          {activeTab === 'policy' && (
            <Card shadow="sm">
              <CardHeader>
                <h2 className="text-base font-semibold">National Policy Configuration</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label="Maximum Review Period (days)"
                  type="number"
                  min={1}
                  max={180}
                  required
                  helperText="Maximum number of days allowed for an IRB to complete a review"
                  error={errors.policy?.maxReviewDays?.message}
                  {...register('policy.maxReviewDays')}
                />
                <Input
                  label="Renewal Grace Period (days)"
                  type="number"
                  min={0}
                  max={90}
                  required
                  helperText="Days before expiry that renewal applications must be submitted"
                  error={errors.policy?.renewalGracePeriodDays?.message}
                  {...register('policy.renewalGracePeriodDays')}
                />
                <Input
                  label="Progress Report Frequency (months)"
                  type="number"
                  min={1}
                  max={12}
                  required
                  helperText="How often applicants must submit progress reports"
                  error={errors.policy?.progressReportFrequencyMonths?.message}
                  {...register('policy.progressReportFrequencyMonths')}
                />
                <Input
                  label="Certificate Validity (months)"
                  type="number"
                  min={1}
                  max={60}
                  required
                  helperText="Default validity period for ethics approval certificates"
                  error={errors.policy?.certificateValidityMonths?.message}
                  {...register('policy.certificateValidityMonths')}
                />
              </CardBody>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card shadow="sm">
              <CardHeader>
                <h2 className="text-base font-semibold">Notification Settings</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label="Admin Notification Email"
                  type="email"
                  required
                  placeholder="admin@rnec.rw"
                  error={errors.notifications?.adminEmail?.message}
                  {...register('notifications.adminEmail')}
                />
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-rnec-teal focus:ring-rnec-teal"
                      {...register('notifications.sendEmailNotifications')}
                    />
                    <span className="text-sm text-slate-700">Enable email notifications system-wide</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-rnec-teal focus:ring-rnec-teal"
                      {...register('notifications.notifyOnNewApplication')}
                    />
                    <span className="text-sm text-slate-700">Notify admin when new applications are submitted</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-rnec-teal focus:ring-rnec-teal"
                      {...register('notifications.notifyOnDecision')}
                    />
                    <span className="text-sm text-slate-700">Notify admin when decisions are recorded</span>
                  </label>
                </div>
              </CardBody>
            </Card>
          )}

          <div className="flex justify-end mt-6">
            <Button variant="primary" type="submit" loading={mutation.isPending}>
              Save Settings
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
