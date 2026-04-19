import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface MetricCardProps {
  label: string
  value: number | string
  icon?: ReactNode
  iconBg?: string
  trend?: {
    value: number
    label?: string
  }
  className?: string
  onClick?: () => void
}

export function MetricCard({
  label,
  value,
  icon,
  iconBg = 'bg-rnec-teal/10',
  trend,
  className,
  onClick,
}: MetricCardProps) {
  const isClickable = !!onClick

  return (
    <div
      className={clsx(
        'rounded-xl border border-slate-200 bg-white p-6 shadow-sm',
        isClickable && 'cursor-pointer hover:shadow-md transition-shadow',
        className,
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {trend && (
            <div
              className={clsx(
                'flex items-center gap-1 mt-2 text-xs font-medium',
                trend.value > 0
                  ? 'text-emerald-600'
                  : trend.value < 0
                    ? 'text-red-500'
                    : 'text-slate-400',
              )}
            >
              {trend.value > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : trend.value < 0 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              <span>
                {trend.value > 0 ? '+' : ''}
                {trend.value}%{trend.label ? ` ${trend.label}` : ' vs last month'}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div
            className={clsx(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              iconBg,
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
