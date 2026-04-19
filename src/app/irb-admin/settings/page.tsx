'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/api/client'

interface IrbSettings {
  institution: {
    name: string
    code: string
    contactEmail: string
    contactPhone: string
    address: string
  }
  review: {
    defaultReviewDays: number
    maxReviewersPerApplication: number
    requireMinimumReviewers: number
  }
  fees: {
    fullBoardFee: number
    expeditedFee: number
    exemptFee: number
    currency: string
  }
}

async function getSettings(): Promise<IrbSettings> {
  const res = await api.get<IrbSettings>('/settings/irb')
  return res.data
}

async function saveSettings(dto: IrbSettings): Promise<IrbSettings> {
  const res = await api.patch<IrbSettings>('/settings/irb', dto)
  return res.data
}

const schema = z.object({
  institution: z.object({
    name: z.string().min(2, 'Institution name is required'),
    code: z.string().min(2, 'Code is required'),
    contactEmail: z.string().email('Valid email required'),
    contactPhone: z.string().min(7, 'Phone is required'),
    address: z.string().min(5, 'Address is required'),
  }),
  review: z.object({
    defaultReviewDays: z.coerce.number().min(1).max(90),
    maxReviewersPerApplication: z.coerce.number().min(1).max(10),
    requireMinimumReviewers: z.coerce.number().min(1).max(10),
  }),
  fees: z.object({
    fullBoardFee: z.coerce.number().min(0),
    expeditedFee: z.coerce.number().min(0),
    exemptFee: z.coerce.number().min(0),
    currency: z.string().min(3, 'Currency code required'),
  }),
})

type FormData = z.infer<typeof schema>

export default function IrbSettingsPage() {
  const [activeTab, setActiveTab] = useState<'institution' | 'review' | 'fees'>('institution')

  const { data: settings, isLoading } = useQuery({
    queryKey: ['irb-settings'],
    queryFn: getSettings,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: settings,
  })

  const mutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      toast.success('Settings saved successfully.')
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to save settings.')
    },
  })

  const tabs = [
    { id: 'institution' as const, label: 'Institution' },
    { id: 'review' as const, label: 'Review Process' },
    { id: 'fees' as const, label: 'Fees' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configure your IRB institution settings</p>
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

          {activeTab === 'institution' && (
            <Card shadow="sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-slate-500" />
                  <h2 className="text-base font-semibold">Institution Information</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Institution Name"
                    required
                    placeholder="e.g. University of Rwanda"
                    error={errors.institution?.name?.message}
                    {...register('institution.name')}
                  />
                  <Input
                    label="Institution Code"
                    required
                    placeholder="e.g. UR-IRB"
                    error={errors.institution?.code?.message}
                    {...register('institution.code')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Contact Email"
                    type="email"
                    required
                    placeholder="irb@institution.ac.rw"
                    error={errors.institution?.contactEmail?.message}
                    {...register('institution.contactEmail')}
                  />
                  <Input
                    label="Contact Phone"
                    type="tel"
                    required
                    placeholder="+250 7XX XXX XXX"
                    error={errors.institution?.contactPhone?.message}
                    {...register('institution.contactPhone')}
                  />
                </div>
                <Input
                  label="Physical Address"
                  required
                  placeholder="Street address, City"
                  error={errors.institution?.address?.message}
                  {...register('institution.address')}
                />
              </CardBody>
            </Card>
          )}

          {activeTab === 'review' && (
            <Card shadow="sm">
              <CardHeader>
                <h2 className="text-base font-semibold">Review Process Configuration</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label="Default Review Period (days)"
                  type="number"
                  min={1}
                  max={90}
                  required
                  helpText="Number of days reviewers have to complete their reviews"
                  error={errors.review?.defaultReviewDays?.message}
                  {...register('review.defaultReviewDays')}
                />
                <Input
                  label="Maximum Reviewers per Application"
                  type="number"
                  min={1}
                  max={10}
                  required
                  error={errors.review?.maxReviewersPerApplication?.message}
                  {...register('review.maxReviewersPerApplication')}
                />
                <Input
                  label="Minimum Required Reviewers"
                  type="number"
                  min={1}
                  max={10}
                  required
                  helpText="Minimum number of completed reviews before a decision can be made"
                  error={errors.review?.requireMinimumReviewers?.message}
                  {...register('review.requireMinimumReviewers')}
                />
              </CardBody>
            </Card>
          )}

          {activeTab === 'fees' && (
            <Card shadow="sm">
              <CardHeader>
                <h2 className="text-base font-semibold">Application Fee Structure</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label="Currency Code"
                  required
                  placeholder="RWF"
                  error={errors.fees?.currency?.message}
                  {...register('fees.currency')}
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Full Board Review Fee"
                    type="number"
                    min={0}
                    required
                    error={errors.fees?.fullBoardFee?.message}
                    {...register('fees.fullBoardFee')}
                  />
                  <Input
                    label="Expedited Review Fee"
                    type="number"
                    min={0}
                    required
                    error={errors.fees?.expeditedFee?.message}
                    {...register('fees.expeditedFee')}
                  />
                  <Input
                    label="Exempt Review Fee"
                    type="number"
                    min={0}
                    required
                    error={errors.fees?.exemptFee?.message}
                    {...register('fees.exemptFee')}
                  />
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
