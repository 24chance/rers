'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, AlertTriangle } from 'lucide-react'
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
  applicationId: z.string().min(1),
  eventDate: z.string().min(1),
  description: z.string().min(10),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING']),
  actionsTaken: z.string().min(10),
  outcome: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function AdverseEventsPage() {
  const [modalOpen, setModalOpen] = useState(false)

  const { data: applications } = useQuery({
    queryKey: ['approved-applications'],
    queryFn: () => applicationsApi.getApplications({ status: ApplicationStatus.APPROVED, limit: 50 }),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { severity: 'MILD' },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      monitoringApi.createAdverseEvent(data.applicationId, {
        eventDate: data.eventDate,
        description: data.description,
        severity: data.severity,
        actionsTaken: data.actionsTaken,
        outcome: data.outcome,
      }),
    onSuccess: () => {
      toast.success('Adverse event reported.')
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
          <h1 className="text-2xl font-bold text-slate-900">Adverse Events</h1>
          <p className="text-slate-500 text-sm mt-0.5">Report adverse events occurring during your studies</p>
        </div>
        <Button variant="danger" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          Report Event
        </Button>
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <strong>Important:</strong> Serious adverse events must be reported within 24 hours of occurrence.
        Life-threatening events must be reported immediately by phone and followed by this form.
      </div>

      <Card>
        <CardBody>
          <EmptyState
            icon={<AlertTriangle className="h-8 w-8 text-slate-400" />}
            title="No adverse events reported"
            description="Report any adverse events that occur during your research study."
          />
        </CardBody>
      </Card>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="Report Adverse Event" size="lg">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="space-y-4">
          <Select label="Study" required options={appOptions} error={errors.applicationId?.message} {...register('applicationId')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Event Date" type="date" required error={errors.eventDate?.message} {...register('eventDate')} />
            <Select
              label="Severity"
              required
              options={[
                { value: 'MILD', label: 'Mild' },
                { value: 'MODERATE', label: 'Moderate' },
                { value: 'SEVERE', label: 'Severe' },
                { value: 'LIFE_THREATENING', label: 'Life Threatening' },
              ]}
              error={errors.severity?.message}
              {...register('severity')}
            />
          </div>
          <Textarea label="Event Description" required placeholder="Describe the adverse event in detail..." error={errors.description?.message} {...register('description')} />
          <Textarea label="Actions Taken" required placeholder="Describe the actions taken in response..." error={errors.actionsTaken?.message} {...register('actionsTaken')} />
          <Textarea label="Outcome (optional)" placeholder="Describe the outcome if known..." {...register('outcome')} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="danger" type="submit" loading={mutation.isPending}>Submit Report</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
