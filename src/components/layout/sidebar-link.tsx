'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export interface SidebarLinkProps {
  href: string
  label: string
  icon?: ReactNode
  badge?: string | number
  exact?: boolean
  collapsed?: boolean
}

function SidebarLink({ href, label, icon, badge, exact = false, collapsed = false }: SidebarLinkProps) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={clsx(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
        'transition-all duration-150',
        isActive
          ? [
              'bg-white/10 text-white',
              // Gold left border
              'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
              'before:h-6 before:w-1 before:rounded-r-full before:bg-rnec-gold',
            ]
          : 'text-white/70 hover:bg-white/10 hover:text-white',
        collapsed && 'justify-center px-2',
      )}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? label : undefined}
    >
      {/* Icon */}
      {icon && (
        <span
          className={clsx(
            'shrink-0 transition-colors',
            isActive ? 'text-rnec-gold' : 'text-white/60 group-hover:text-white/90',
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      {/* Label */}
      {!collapsed && (
        <span className="flex-1 truncate">{label}</span>
      )}

      {/* Badge */}
      {!collapsed && badge !== undefined && badge !== 0 && (
        <span
          className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rnec-gold px-1.5 text-[10px] font-bold text-rnec-navy"
          aria-label={`${badge} items`}
        >
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}

export { SidebarLink }
