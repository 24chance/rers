'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { toast } from '@/components/ui/toast'
import { applicationsApi } from '@/lib/api/applications.api'
import { monitoringApi } from '@/lib/api/monitoring.api'
import { ApplicationStatus } from '@/types'
import { format } from 'date-fns'

const schema = z.object({
  applicationId: z.string().min(1, 'Please select an application'),
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  justification: z.string().min(10, 'Justification is required'),
})

type FormData = z.infer<typeof schema>

export default function ApplicantAmendmentsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: applications } = useQuery({
    queryKey: ['approved-applications'],
    queryFn: () =>
      applicationsApi.getApplications({ status: ApplicationStatus.APPROVED, limit: 50 }),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      monitoringApi.createAmendment(data.applicationId, {
        title: data.title,
        description: data.description,
        justification: data.justification,
      }),
    onSuccess: () => {
      toast.success('Amendment submitted successfully.')
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
          <h1 className="text-2xl font-bold text-slate-900">Amendments</h1>
          <p className="text-slate-500 text-sm mt-0.5">Request amendments to approved studies</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          New Amendment
        </Button>
      </div>

      <Card shadow="sm">
        <CardBody>
          <EmptyState
            icon={<Edit className="h-8 w-8 text-slate-400" />}
            title="No amendments submitted"
            description="Use the button above to request an amendment to an approved study."
            action={
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
                New Amendment
              </Button>
            }
          />
        </CardBody>
      </Card>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Submit Amendment Request"
        description="Request a protocol amendment for an approved study."
        size="lg"
      >
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="space-y-4">
          <Select
            label="Study"
            required
            options={appOptions}
            error={errors.applicationId?.message}
            {...register('applicationId')}
          />
          <Input
            label="Amendment Title"
            required
            placeholder="Brief title for the amendment"
            error={errors.title?.message}
            {...register('title')}
          />
          <Textarea
            label="Description of Changes"
            required
            placeholder="Describe the proposed changes in detail..."
            error={errors.description?.message}
            {...register('description')}
          />
          <Textarea
            label="Justification"
            required
            placeholder="Explain the reason for this amendment..."
            error={errors.justification?.message}
            {...register('justification')}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={mutation.isPending}>
              Submit Amendment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
