'use client'

import { Building2, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'
import { useUIStore } from '@/store/ui.store'

export interface TenantIndicatorProps {
  className?: string
  onClick?: () => void
  interactive?: boolean
}

function TenantIndicator({ className, onClick, interactive = false }: TenantIndicatorProps) {
  const selectedTenant = useUIStore((s) => s.selectedTenant)

  const name = selectedTenant?.name ?? 'All Institutions'
  const code = selectedTenant?.code

  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-lg px-3 py-2',
        interactive
          ? 'cursor-pointer hover:bg-slate-100 transition-colors duration-150'
          : 'bg-slate-50 border border-slate-200',
        className,
      )}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-haspopup={interactive ? 'listbox' : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
    >
      {/* Icon */}
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rnec-navy/10">
        <Building2 className="h-4 w-4 text-rnec-navy" aria-hidden="true" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{name}</p>
        {code && (
          <p className="truncate text-xs text-slate-500">{code}</p>
        )}
      </div>

      {interactive && (
        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
      )}
    </div>
  )
}

export { TenantIndicator }
