import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import type { ApplicationStatus } from '@/types'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        navy: 'bg-rnec-navy text-white',
        teal: 'bg-rnec-teal text-white',
        gold: 'bg-rnec-gold text-rnec-navy',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={clsx(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={clsx(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'danger' && 'bg-red-500',
            variant === 'info' && 'bg-blue-500',
            (!variant || variant === 'default') && 'bg-slate-500',
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

// Utility: map ApplicationStatus to badge variant
export function getStatusBadgeVariant(
  status: ApplicationStatus,
): VariantProps<typeof badgeVariants>['variant'] {
  const map: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
    DRAFT: 'default',
    SUBMITTED: 'info',
    SCREENING: 'info',
    PAYMENT_PENDING: 'warning',
    PAYMENT_VERIFIED: 'teal',
    UNDER_REVIEW: 'info',
    QUERY_RAISED: 'warning',
    RESPONSE_RECEIVED: 'info',
    DECISION_PENDING: 'warning',
    APPROVED: 'success',
    CONDITIONALLY_APPROVED: 'success',
    REJECTED: 'danger',
    AMENDMENT_PENDING: 'warning',
    MONITORING_ACTIVE: 'teal',
    CLOSED: 'default',
  }
  return map[status] ?? 'default'
}

export { Badge, badgeVariants }
