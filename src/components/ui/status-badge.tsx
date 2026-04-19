import { clsx } from 'clsx'
import type { ApplicationStatus } from '@/types'

export interface StatusConfig {
  label: string
  bg: string
  text: string
  dot: string
}

export const statusConfigMap: Record<ApplicationStatus, StatusConfig> = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  },
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  SCREENING: {
    label: 'Screening',
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },
  PAYMENT_PENDING: {
    label: 'Payment Pending',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  PAYMENT_VERIFIED: {
    label: 'Payment Verified',
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  QUERY_RAISED: {
    label: 'Query Raised',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
  },
  RESPONSE_RECEIVED: {
    label: 'Response Received',
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    dot: 'bg-cyan-500',
  },
  DECISION_PENDING: {
    label: 'Decision Pending',
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  CONDITIONALLY_APPROVED: {
    label: 'Conditionally Approved',
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
  AMENDMENT_PENDING: {
    label: 'Amendment Pending',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  MONITORING_ACTIVE: {
    label: 'Monitoring Active',
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
  },
  CLOSED: {
    label: 'Closed',
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
  },
}

export interface StatusBadgeProps {
  status: ApplicationStatus
  showDot?: boolean
  className?: string
}

function StatusBadge({ status, showDot = true, className }: StatusBadgeProps) {
  const config = statusConfigMap[status]

  if (!config) {
    return (
      <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600', className)}>
        {status}
      </span>
    )
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        config.bg,
        config.text,
        className,
      )}
    >
      {showDot && (
        <span
          className={clsx('h-1.5 w-1.5 rounded-full shrink-0', config.dot)}
          aria-hidden="true"
        />
      )}
      {config.label}
    </span>
  )
}

export { StatusBadge }
