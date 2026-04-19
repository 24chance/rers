import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { clsx } from 'clsx'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  showHome?: boolean
  className?: string
}

function Breadcrumb({ items, showHome = true, className }: BreadcrumbProps) {
  const allItems: BreadcrumbItem[] = showHome ? [{ label: 'Home', href: '/' }, ...items] : items

  return (
    <nav aria-label="Breadcrumb" className={clsx('flex items-center', className)}>
      <ol className="flex items-center gap-1 text-sm flex-wrap">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          const isHome = showHome && index === 0

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-slate-400 shrink-0"
                  aria-hidden="true"
                />
              )}

              {isLast || !item.href ? (
                <span
                  className="text-slate-500 font-medium"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {isHome ? (
                    <Home className="h-4 w-4" aria-label="Home" />
                  ) : (
                    item.label
                  )}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={clsx(
                    'text-slate-500 transition-colors hover:text-rnec-teal',
                    'focus:outline-none focus:ring-2 focus:ring-rnec-teal rounded',
                  )}
                >
                  {isHome ? (
                    <Home className="h-4 w-4" aria-label="Home" />
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export { Breadcrumb }
