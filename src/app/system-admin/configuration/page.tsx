'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings2 } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/api/client'

interface SystemConfiguration {
  general: {
    platformName: string
    supportEmail: string
    maintenanceMode: boolean
    allowNewRegistrations: boolean
    requireEmailVerification: boolean
  }
  security: {
    sessionTimeoutMinutes: number
    maxLoginAttempts: number
    passwordMinLength: number
    requireMfa: boolean
    jwtExpiryHours: number
  }
  email: {
    fromName: string
    fromEmail: string
    smtpHost: string
    smtpPort: number
    welcomeEmailTemplate: string
    applicationReceivedTemplate: string
    decisionIssuedTemplate: string
  }
  storage: {
    maxFileSizeMb: number
    allowedMimeTypes: string
    storageBucket: string
  }
}

async function getConfiguration(): Promise<SystemConfiguration> {
  const res = await api.get<SystemConfiguration>('/system/configuration')
  return res.data
}

async function saveConfiguration(dto: SystemConfiguration): Promise<SystemConfiguration> {
  const res = await api.patch<SystemConfiguration>('/system/configuration', dto)
  return res.data
}

const schema = z.object({
  general: z.object({
    platformName: z.string().min(2),
    supportEmail: z.string().email(),
    maintenanceMode: z.boolean(),
    allowNewRegistrations: z.boolean(),
    requireEmailVerification: z.boolean(),
  }),
  security: z.object({
    sessionTimeoutMinutes: z.coerce.number().min(5).max(1440),
    maxLoginAttempts: z.coerce.number().min(3).max(20),
    passwordMinLength: z.coerce.number().min(6).max(32),
    requireMfa: z.boolean(),
    jwtExpiryHours: z.coerce.number().min(1).max(168),
  }),
  email: z.object({
    fromName: z.string().min(1),
    fromEmail: z.string().email(),
    smtpHost: z.string().min(1),
    smtpPort: z.coerce.number().min(1).max(65535),
    welcomeEmailTemplate: z.string(),
    applicationReceivedTemplate: z.string(),
    decisionIssuedTemplate: z.string(),
  }),
  storage: z.object({
    maxFileSizeMb: z.coerce.number().min(1).max(500),
    allowedMimeTypes: z.string().min(1),
    storageBucket: z.string().min(1),
  }),
})

type FormData = z.infer<typeof schema>

const tabs = [
  { id: 'general' as const, label: 'General' },
  { id: 'security' as const, label: 'Security' },
  { id: 'email' as const, label: 'Email' },
  { id: 'storage' as const, label: 'Storage' },
]

export default function SystemConfigurationPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'email' | 'storage'>('general')

  const { data: config, isLoading } = useQuery({
    queryKey: ['system-configuration'],
    queryFn: getConfiguration,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: config,
  })

  const mutation = useMutation({
    mutationFn: saveConfiguration,
    onSuccess: () => {
      toast.success('Configuration saved.')
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to save configuration.')
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Configuration</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform-wide settings and feature configuration</p>
      </div>

      {isLoading ? (
        <Loader centered label="Loading configuration..." />
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

          {activeTab === 'general' && (
            <Card shadow="sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-slate-500" />
                  <h2 className="text-base font-semibold">General Settings</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Platform Name"
                    required
                    placeholder="RNEC Ethics Portal"
                    error={errors.general?.platformName?.message}
                    {...register('general.platformName')}
                  />
                  <Input
                    label="Support Email"
                    type="email"
                    required
                    placeholder="support@rnec.rw"
                    error={errors.general?.supportEmail?.message}
                    {...register('general.supportEmail')}
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-rnec-teal focus:ring-rnec-teal"
                      {...register('general.maintenanceMode')}
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700">Maintenance Mode</span>
                      <p className="text-xs text-slate-500">Prevents all logins except system admins</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-rnec-teal focus:ring-rnec-teal"
                      {...register('general.allowNewRegistrations')}
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700">Allow New Registrations</span>
                      <p className="text-xs text-slate-500">Enable public user registration</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-rnec-teal focus:ring-rnec-teal"
                      {...register('general.requireEmailVerification')}
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700">Require Email Verification</span>
                      <p className="text-xs text-slate-500">Users must verify email before accessing the platform</p>
                    </div>
                  </label>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card shadow="sm">
              <CardHeader>
                <h2 className="text-base font-semibold">Security Settings</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Session Timeout (minutes)"
                    type="number"
                    min={5}
                    max={1440}
                    required
                    error={errors.security?.sessionTimeoutMinutes?.message}
                    {...register('security.sessionTimeoutMinutes')}
                  />
                  <Input
                    label="JWT Expiry (hours)"
                    type="number"
                    min={1}
                    max={168}
                    required
                    error={errors.security?.jwtExpiryHours?.message}
                    {...register('security.jwtExpiryHours')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Max Login Attempts"
                    type="number"
                    min={3}
                    max={20}
                    required
                    error={errors.security?.maxLoginAttempts?.message}
                    {...register('security.maxLoginAttempts')}
                  />
                  <Input
                    label="Min Password Length"
                    type="number"
                    min={6}
                    max={32}
                    required
                    error={errors.security?.passwordMinLength?.message}
                    {...register('security.passwordMinLength')}
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-rnec-teal focus:ring-rnec-teal"
                    {...register('security.requireMfa')}
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">Require Multi-Factor Authentication</span>
                    <p className="text-xs text-slate-500">Enforce MFA for all privileged roles</p>
                  </div>
                </label>
              </CardBody>
            </Card>
          )}

          {activeTab === 'email' && (
            <Card shadow="sm">
              <CardHeader>
                <h2 className="text-base font-semibold">Email Configuration</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Sender Name"
                    required
                    placeholder="RNEC Ethics Portal"
                    error={errors.email?.fromName?.message}
                    {...register('email.fromName')}
                  />
                  <Input
                    label="Sender Email"
                    type="email"
                    required
                    placeholder="noreply@rnec.rw"
                    error={errors.email?.fromEmail?.message}
                    {...register('email.fromEmail')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="SMTP Host"
                    required
                    placeholder="smtp.sendgrid.net"
                    error={errors.email?.smtpHost?.message}
                    {...register('email.smtpHost')}
                  />
                  <Input
                    label="SMTP Port"
                    type="number"
                    min={1}
                    max={65535}
                    required
                    placeholder="587"
                    error={errors.email?.smtpPort?.message}
                    {...register('email.smtpPort')}
                  />
                </div>
                <Textarea
                  label="Welcome Email Template"
                  placeholder="Template body with {{firstName}}, {{verificationLink}} variables..."
                  {...register('email.welcomeEmailTemplate')}
                  rows={4}
                />
                <Textarea
                  label="Application Received Template"
                  placeholder="Template body with {{referenceNumber}}, {{title}} variables..."
                  {...register('email.applicationReceivedTemplate')}
                  rows={4}
                />
                <Textarea
                  label="Decision Issued Template"
                  placeholder="Template body with {{decision}}, {{conditions}} variables..."
                  {...register('email.decisionIssuedTemplate')}
                  rows={4}
                />
              </CardBody>
            </Card>
          )}

          {activeTab === 'storage' && (
            <Card shadow="sm">
              <CardHeader>
                <h2 className="text-base font-semibold">File Storage Settings</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label="Maximum File Size (MB)"
                  type="number"
                  min={1}
                  max={500}
                  required
                  error={errors.storage?.maxFileSizeMb?.message}
                  {...register('storage.maxFileSizeMb')}
                />
                <Input
                  label="Allowed MIME Types"
                  required
                  placeholder="application/pdf,image/jpeg,image/png,application/msword"
                  helpText="Comma-separated list of allowed MIME types"
                  error={errors.storage?.allowedMimeTypes?.message}
                  {...register('storage.allowedMimeTypes')}
                />
                <Input
                  label="Storage Bucket"
                  required
                  placeholder="rnec-documents-prod"
                  helpText="Cloud storage bucket name"
                  error={errors.storage?.storageBucket?.message}
                  {...register('storage.storageBucket')}
                />
              </CardBody>
            </Card>
          )}

          <div className="flex justify-end mt-6">
            <Button variant="primary" type="submit" loading={mutation.isPending}>
              Save Configuration
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
