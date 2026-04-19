'use client'

import { Bell } from 'lucide-react'
import { clsx } from 'clsx'
import { useUIStore } from '@/store/ui.store'

export interface NotificationBellProps {
  unreadCount?: number
  className?: string
}

function NotificationBell({ unreadCount = 0, className }: NotificationBellProps) {
  const toggleNotificationDrawer = useUIStore((s) => s.toggleNotificationDrawer)

  const displayCount = unreadCount > 99 ? '99+' : unreadCount

  return (
    <button
      onClick={toggleNotificationDrawer}
      className={clsx(
        'relative flex h-9 w-9 items-center justify-center rounded-lg',
        'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-rnec-teal focus:ring-offset-2',
        className,
      )}
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : 'Notifications'
      }
    >
      <Bell className="h-5 w-5" aria-hidden="true" />

      {unreadCount > 0 && (
        <span
          className={clsx(
            'absolute -top-0.5 -right-0.5 flex items-center justify-center',
            'rounded-full bg-red-500 text-white',
            'text-[10px] font-bold leading-none',
            displayCount === '99+' ? 'h-5 px-1 min-w-[1.25rem]' : 'h-4 w-4',
          )}
          aria-hidden="true"
        >
          {displayCount}
        </span>
      )}
    </button>
  )
}

export { NotificationBell }
