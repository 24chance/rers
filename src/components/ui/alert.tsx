'use client'

import { clsx } from 'clsx'
import { useState } from 'react'
import { AlertCircle, CheckCircle, Info, TriangleAlert, X } from 'lucide-react'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

export interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
  icon?: React.ReactNode
}

const variantConfig: Record<
  AlertVariant,
  { container: string; icon: React.ReactNode; title: string }
> = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" aria-hidden="true" />,
    title: 'text-blue-900',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />,
    title: 'text-emerald-900',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: <TriangleAlert className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" aria-hidden="true" />,
    title: 'text-amber-900',
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />,
    title: 'text-red-900',
  },
}

function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
  icon,
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false)
  const config = variantConfig[variant]

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <div
      role="alert"
      className={clsx(
        'relative flex gap-3 rounded-lg border p-4 text-sm',
        config.container,
        className,
      )}
    >
      {/* Icon */}
      <span>{icon ?? config.icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={clsx('font-semibold mb-1', config.title)}>{title}</p>
        )}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>

      {/* Dismiss */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-current"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export { Alert }
