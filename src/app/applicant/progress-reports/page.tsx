'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, BarChart2 } from 'lucide-react'
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
  reportingPeriodStart: z.string().min(1),
  reportingPeriodEnd: z.string().min(1),
  participantsEnrolled: z.coerce.number().min(0),
  summary: z.string().min(20),
  adverseEvents: z.string().optional(),
  protocolDeviations: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function ProgressReportsPage() {
  const [modalOpen, setModalOpen] = useState(false)

  const { data: applications } = useQuery({
    queryKey: ['approved-applications'],
    queryFn: () => applicationsApi.getApplications({ status: ApplicationStatus.APPROVED, limit: 50 }),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      monitoringApi.createProgressReport(data.applicationId, {
        reportingPeriodStart: data.reportingPeriodStart,
        reportingPeriodEnd: data.reportingPeriodEnd,
        participantsEnrolled: data.participantsEnrolled,
        summary: data.summary,
        adverseEvents: data.adverseEvents,
        protocolDeviations: data.protocolDeviations,
      }),
    onSuccess: () => {
      toast.success('Progress report submitted.')
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
          <h1 className="text-2xl font-bold text-slate-900">Progress Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">Submit periodic progress reports for active studies</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          Submit Report
        </Button>
      </div>

      <Card>
        <CardBody>
          <EmptyState
            icon={<BarChart2 className="h-8 w-8 text-slate-400" />}
            title="No progress reports"
            description="Submit progress reports for your approved studies."
            action={
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
                Submit Report
              </Button>
            }
          />
        </CardBody>
      </Card>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="Submit Progress Report" size="lg">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="space-y-4">
          <Select label="Study" required options={appOptions} error={errors.applicationId?.message} {...register('applicationId')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Reporting Period Start" type="date" required error={errors.reportingPeriodStart?.message} {...register('reportingPeriodStart')} />
            <Input label="Reporting Period End" type="date" required error={errors.reportingPeriodEnd?.message} {...register('reportingPeriodEnd')} />
          </div>
          <Input label="Participants Enrolled" type="number" min={0} required error={errors.participantsEnrolled?.message} {...register('participantsEnrolled')} />
          <Textarea label="Progress Summary" required placeholder="Describe progress made during this period..." error={errors.summary?.message} {...register('summary')} />
          <Textarea label="Adverse Events (optional)" placeholder="Report any adverse events..." {...register('adverseEvents')} />
          <Textarea label="Protocol Deviations (optional)" placeholder="Report any deviations from approved protocol..." {...register('protocolDeviations')} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={mutation.isPending}>Submit Report</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
