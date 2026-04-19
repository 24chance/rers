import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/card'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import type { Decision } from '@/types'
import { DecisionType } from '@/types'

const decisionConfig: Record<DecisionType, { icon: React.ReactNode; bg: string; border: string; text: string; label: string }> = {
  [DecisionType.APPROVED]: {
    icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    label: 'Approved',
  },
  [DecisionType.CONDITIONALLY_APPROVED]: {
    icon: <AlertCircle className="h-5 w-5 text-teal-600" />,
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-800',
    label: 'Conditionally Approved',
  },
  [DecisionType.REJECTED]: {
    icon: <XCircle className="h-5 w-5 text-red-600" />,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    label: 'Rejected',
  },
  [DecisionType.DEFERRED]: {
    icon: <Clock className="h-5 w-5 text-amber-600" />,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    label: 'Deferred',
  },
}

export interface DecisionSummaryCardProps {
  decision: Decision
}

export function DecisionSummaryCard({ decision }: DecisionSummaryCardProps) {
  const config = decisionConfig[decision.type]

  return (
    <Card shadow="sm" className={clsx('border', config.border)}>
      <CardBody className={config.bg}>
        <div className="flex items-start gap-4">
          <div className="shrink-0 mt-0.5">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={clsx('text-base font-bold', config.text)}>{config.label}</span>
              <span className="text-xs text-slate-400">
                {format(new Date(decision.createdAt), 'dd MMM yyyy')}
              </span>
            </div>

            {decision.rationale && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Rationale</p>
                <p className="text-sm text-slate-700">{decision.rationale}</p>
              </div>
            )}

            {decision.conditions && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Conditions</p>
                <p className="text-sm text-slate-700">{decision.conditions}</p>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
