'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Gavel } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { toast } from '@/components/ui/toast'
import { applicationsApi } from '@/lib/api/applications.api'
import { decisionsApi } from '@/lib/api/decisions.api'
import { ApplicationStatus, DecisionType } from '@/types'
import type { Application } from '@/types'
import { format } from 'date-fns'

export default function ChairpersonDecisionsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [decisionModalOpen, setDecisionModalOpen] = useState(false)
  const [decisionType, setDecisionType] = useState<DecisionType>(DecisionType.APPROVED)
  const [rationale, setRationale] = useState('')
  const [conditions, setConditions] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['decision-pending', page],
    queryFn: () =>
      applicationsApi.getApplications({
        status: ApplicationStatus.DECISION_PENDING,
        page,
        limit: 15,
      }),
  })

  const decisionMutation = useMutation({
    mutationFn: () =>
      decisionsApi.recordDecision(selectedApp!.id, {
        type: decisionType,
        rationale,
        conditions: conditions || undefined,
      }),
    onSuccess: () => {
      toast.success('Decision recorded successfully.')
      setDecisionModalOpen(false)
      setSelectedApp(null)
      setRationale('')
      setConditions('')
      queryClient.invalidateQueries({ queryKey: ['decision-pending'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to record decision.')
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Decisions</h1>
        <p className="text-slate-500 text-sm mt-0.5">Applications awaiting chairperson decision</p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Pending Decisions</h2>
            {data && (
              <span className="text-sm text-slate-400">{data.meta.total} application(s)</span>
            )}
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading..." />
          ) : isError ? (
            <EmptyState title="Failed to load" description="Please refresh." />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<Gavel className="h-8 w-8 text-slate-400" />}
              title="No pending decisions"
              description="All applications have been resolved."
            />
          ) : (
            <>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Ref No.</TableHeader>
                    <TableHeader>Title</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Submitted</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {data.data.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold">{app.referenceNumber}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-slate-900 line-clamp-1">{app.title}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-600">{app.type.replace(/_/g, ' ')}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={app.status} />
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">
                          {app.submittedAt ? format(new Date(app.submittedAt), 'dd MMM yyyy') : '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Gavel className="h-3.5 w-3.5" />}
                          onClick={() => {
                            setSelectedApp(app)
                            setDecisionModalOpen(true)
                          }}
                        >
                          Record Decision
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.meta && (
                <div className="px-4">
                  <Pagination meta={data.meta} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Decision Modal */}
      <Modal
        open={decisionModalOpen}
        onOpenChange={setDecisionModalOpen}
        title="Record Decision"
        description={selectedApp ? `Decision for: ${selectedApp.title}` : undefined}
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Decision Type"
            required
            value={decisionType}
            onChange={(e) => setDecisionType(e.target.value as DecisionType)}
            options={[
              { value: DecisionType.APPROVED, label: 'Approved' },
              { value: DecisionType.CONDITIONALLY_APPROVED, label: 'Conditionally Approved' },
              { value: DecisionType.REJECTED, label: 'Rejected' },
              { value: DecisionType.DEFERRED, label: 'Deferred' },
            ]}
          />
          <Textarea
            label="Rationale"
            required
            placeholder="Provide the rationale for this decision..."
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            rows={4}
          />
          {decisionType === DecisionType.CONDITIONALLY_APPROVED && (
            <Textarea
              label="Conditions"
              placeholder="List conditions that must be met prior to full approval..."
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              rows={3}
            />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDecisionModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={decisionMutation.isPending}
              disabled={!rationale.trim()}
              onClick={() => decisionMutation.mutate()}
              leftIcon={<Gavel className="h-4 w-4" />}
            >
              Record Decision
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
