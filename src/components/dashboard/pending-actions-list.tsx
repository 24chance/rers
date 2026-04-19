import { clsx } from 'clsx'
import Link from 'next/link'
import { ArrowRight, AlertCircle, CreditCard, MessageSquare } from 'lucide-react'

export interface PendingAction {
  id: string
  title: string
  description: string
  type: 'payment' | 'query' | 'document' | 'general'
  href: string
  urgent?: boolean
}

export interface PendingActionsListProps {
  actions: PendingAction[]
  className?: string
}

const typeConfig = {
  payment: {
    icon: <CreditCard className="h-4 w-4" />,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
  },
  query: {
    icon: <MessageSquare className="h-4 w-4" />,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
  document: {
    icon: <AlertCircle className="h-4 w-4" />,
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    iconColor: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
  },
  general: {
    icon: <AlertCircle className="h-4 w-4" />,
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    iconColor: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700',
  },
}

export function PendingActionsList({ actions, className }: PendingActionsListProps) {
  if (!actions.length) {
    return (
      <div className={clsx('py-8 text-center', className)}>
        <p className="text-sm text-slate-500">No pending actions. You&apos;re all caught up!</p>
      </div>
    )
  }

  return (
    <div className={clsx('space-y-3', className)}>
      {actions.map((action) => {
        const config = typeConfig[action.type]
        return (
          <Link
            key={action.id}
            href={action.href}
            className={clsx(
              'flex items-start gap-4 rounded-lg border p-4 transition-shadow hover:shadow-sm',
              config.bg,
              config.border,
              action.urgent && 'ring-2 ring-red-300',
            )}
          >
            <div className={clsx('mt-0.5 shrink-0', config.iconColor)}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-900 truncate">{action.title}</p>
                {action.urgent && (
                  <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                    Urgent
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{action.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
          </Link>
        )
      })}
    </div>
  )
}
