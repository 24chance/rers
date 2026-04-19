import { clsx } from 'clsx'
import { format } from 'date-fns'
import { CheckCircle, Circle, ArrowRight } from 'lucide-react'
import type { WorkflowTransition } from '@/types'

export interface StatusTimelineProps {
  transitions: WorkflowTransition[]
  className?: string
}

export function StatusTimeline({ transitions, className }: StatusTimelineProps) {
  if (!transitions.length) {
    return (
      <p className="text-sm text-slate-400 py-4">No workflow history available.</p>
    )
  }

  const sorted = [...transitions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  return (
    <div className={clsx('space-y-0', className)}>
      {sorted.map((transition, index) => {
        const isLast = index === sorted.length - 1
        return (
          <div key={transition.id} className="flex gap-4">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  isLast
                    ? 'bg-rnec-teal text-white'
                    : 'bg-slate-100 text-slate-400',
                )}
              >
                {isLast ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3 fill-current" />
                )}
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-slate-200 my-1" />
              )}
            </div>

            {/* Content */}
            <div className={clsx('pb-5 flex-1 min-w-0', isLast && 'pb-0')}>
              <div className="flex items-start gap-2 flex-wrap">
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    'bg-slate-100 text-slate-600',
                  )}
                >
                  {transition.fromStatus.replace(/_/g, ' ')}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    isLast
                      ? 'bg-rnec-teal/10 text-rnec-teal'
                      : 'bg-slate-100 text-slate-700',
                  )}
                >
                  {transition.toStatus.replace(/_/g, ' ')}
                </span>
              </div>

              {transition.reason && (
                <p className="mt-1 text-xs text-slate-500">{transition.reason}</p>
              )}

              <p className="mt-1 text-[11px] text-slate-400">
                {format(new Date(transition.createdAt), 'dd MMM yyyy, HH:mm')}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
