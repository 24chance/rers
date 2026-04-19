'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, RefreshCw } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { toast } from '@/components/ui/toast'
import { applicationsApi } from '@/lib/api/applications.api'
import { monitoringApi } from '@/lib/api/monitoring.api'
import { ApplicationStatus } from '@/types'

const schema = z.object({
  applicationId: z.string().min(1, 'Please select an application'),
  renewalPeriodMonths: z.coerce.number().min(1).max(24),
  justification: z.string().min(10),
  progressSummary: z.string().min(10),
})

type FormData = z.infer<typeof schema>

export default function ApplicantRenewalsPage() {
  const [modalOpen, setModalOpen] = useState(false)

  const { data: applications } = useQuery({
    queryKey: ['approved-applications'],
    queryFn: () =>
      applicationsApi.getApplications({ status: ApplicationStatus.APPROVED, limit: 50 }),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { renewalPeriodMonths: 12 },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      monitoringApi.createRenewal(data.applicationId, {
        renewalPeriodMonths: data.renewalPeriodMonths,
        justification: data.justification,
        progressSummary: data.progressSummary,
      }),
    onSuccess: () => {
      toast.success('Renewal application submitted.')
      setModalOpen(false)
      reset()
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Submission failed.')
    },
  })

  const appOptions = [
    { value: '', label: 'Select application...' },
    ...(applications?.data.map((a) => ({ value: a.id, label: `${a.referenceNumber} — ${a.title}` })) ?? []),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Renewals</h1>
          <p className="text-slate-500 text-sm mt-0.5">Request renewal of ethics approval for ongoing studies</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          New Renewal
        </Button>
      </div>

      <Card>
        <CardBody>
          <EmptyState
            icon={<RefreshCw className="h-8 w-8 text-slate-400" />}
            title="No renewal requests"
            description="Request a renewal when your ethics approval is nearing expiry."
            action={
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
                New Renewal
              </Button>
            }
          />
        </CardBody>
      </Card>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="Submit Renewal Application" size="lg">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="space-y-4">
          <Select label="Study" required options={appOptions} error={errors.applicationId?.message} {...register('applicationId')} />
          <Input label="Renewal Period (months)" type="number" min={1} max={24} required error={errors.renewalPeriodMonths?.message} {...register('renewalPeriodMonths')} />
          <Textarea label="Progress Summary" required placeholder="Summarize study progress to date..." error={errors.progressSummary?.message} {...register('progressSummary')} />
          <Textarea label="Justification for Renewal" required placeholder="Why is renewal needed?" error={errors.justification?.message} {...register('justification')} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={mutation.isPending}>Submit Renewal</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
