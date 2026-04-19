'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Calendar, Clock, MapPin, Users } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/api/client'
import { format, parseISO, isFuture, isPast } from 'date-fns'

interface BoardMeeting {
  id: string
  title: string
  scheduledAt: string
  durationMinutes: number
  location: string
  agenda: string
  attendees: string[]
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  minutesUrl?: string
  applicationIds: string[]
}

async function getMeetings(): Promise<BoardMeeting[]> {
  const res = await api.get<BoardMeeting[]>('/meetings')
  return res.data
}

async function createMeeting(dto: {
  title: string
  scheduledAt: string
  durationMinutes: number
  location: string
  agenda: string
}): Promise<BoardMeeting> {
  const res = await api.post<BoardMeeting>('/meetings', dto)
  return res.data
}

const schema = z.object({
  title: z.string().min(3, 'Meeting title is required'),
  scheduledAt: z.string().min(1, 'Meeting date and time is required'),
  durationMinutes: z.coerce.number().min(30).max(480),
  location: z.string().min(3, 'Location is required'),
  agenda: z.string().min(10, 'Agenda is required'),
})

type FormData = z.infer<typeof schema>

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function ChairpersonMeetingsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: meetings, isLoading, isError } = useQuery({
    queryKey: ['board-meetings'],
    queryFn: getMeetings,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { durationMinutes: 120 },
  })

  const mutation = useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      toast.success('Board meeting scheduled.')
      setModalOpen(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ['board-meetings'] })
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? 'Failed to schedule meeting.')
    },
  })

  const upcoming = meetings?.filter((m) => m.status === 'SCHEDULED' && isFuture(parseISO(m.scheduledAt))) ?? []
  const past = meetings?.filter((m) => m.status === 'COMPLETED' || isPast(parseISO(m.scheduledAt))) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Board Meetings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Schedule and manage IRB board meetings</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          Schedule Meeting
        </Button>
      </div>

      {isLoading ? (
        <Loader centered label="Loading meetings..." />
      ) : isError ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4 text-sm text-red-700">
          Failed to load meetings. Please refresh.
        </div>
      ) : (
        <>
          {/* Upcoming meetings */}
          <Card shadow="sm">
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900">Upcoming Meetings</h2>
            </CardHeader>
            <CardBody className="p-0">
              {!upcoming.length ? (
                <EmptyState
                  icon={<Calendar className="h-8 w-8 text-slate-400" />}
                  title="No upcoming meetings"
                  description="Schedule a board meeting using the button above."
                  action={
                    <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
                      Schedule Meeting
                    </Button>
                  }
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcoming.map((meeting) => (
                    <MeetingRow
                      key={meeting.id}
                      meeting={meeting}
                      expanded={expandedId === meeting.id}
                      onToggle={() => setExpandedId(expandedId === meeting.id ? null : meeting.id)}
                    />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Past meetings */}
          {past.length > 0 && (
            <Card shadow="sm">
              <CardHeader>
                <h2 className="text-base font-semibold text-slate-900">Past Meetings</h2>
              </CardHeader>
              <CardBody className="p-0">
                <div className="divide-y divide-slate-100">
                  {past.map((meeting) => (
                    <MeetingRow
                      key={meeting.id}
                      meeting={meeting}
                      expanded={expandedId === meeting.id}
                      onToggle={() => setExpandedId(expandedId === meeting.id ? null : meeting.id)}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Schedule Board Meeting"
        description="Add a new board meeting to the calendar."
        size="lg"
      >
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="space-y-4">
          <Input
            label="Meeting Title"
            required
            placeholder="e.g. Full Board Review — May 2026"
            error={errors.title?.message}
            {...register('title')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date & Time"
              type="datetime-local"
              required
              error={errors.scheduledAt?.message}
              {...register('scheduledAt')}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              min={30}
              max={480}
              required
              error={errors.durationMinutes?.message}
              {...register('durationMinutes')}
            />
          </div>
          <Input
            label="Location"
            required
            placeholder="e.g. Boardroom A, Main Campus / Zoom link"
            error={errors.location?.message}
            {...register('location')}
          />
          <Textarea
            label="Agenda"
            required
            placeholder="List the agenda items for this meeting..."
            error={errors.agenda?.message}
            {...register('agenda')}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={mutation.isPending}>
              Schedule Meeting
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function MeetingRow({
  meeting,
  expanded,
  onToggle,
}: {
  meeting: BoardMeeting
  expanded: boolean
  onToggle: () => void
}) {
  const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  return (
    <div className="px-6 py-4">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{meeting.title}</h3>
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                statusColors[meeting.status] ?? 'bg-slate-100 text-slate-600'
              }`}
            >
              {meeting.status}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(parseISO(meeting.scheduledAt), 'dd MMM yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(parseISO(meeting.scheduledAt), 'HH:mm')} ({meeting.durationMinutes} min)
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {meeting.location}
            </span>
            {meeting.applicationIds?.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {meeting.applicationIds.length} application(s)
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" type="button">
          {expanded ? 'Hide' : 'Details'}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">Agenda</h4>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{meeting.agenda}</p>
          {meeting.attendees?.length > 0 && (
            <>
              <h4 className="text-xs font-semibold text-slate-700 mb-1 mt-3 uppercase tracking-wide">Attendees</h4>
              <div className="flex flex-wrap gap-2">
                {meeting.attendees.map((a, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </>
          )}
          {meeting.minutesUrl && (
            <div className="mt-3">
              <a
                href={meeting.minutesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-rnec-teal hover:underline font-medium"
              >
                View Meeting Minutes
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
