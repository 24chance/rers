import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { FileX } from 'lucide-react'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      )}
    >
      {/* Icon */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        {icon ?? <FileX className="h-8 w-8 text-slate-400" aria-hidden="true" />}
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>

      {description && (
        <p className="mt-2 text-sm text-slate-500 max-w-sm">{description}</p>
      )}

      {/* Action */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export { EmptyState }
