'use client'

import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import type { PaginatedResponse } from '@/types'

export interface PaginationProps {
  meta: PaginatedResponse<unknown>['meta']
  onPageChange: (page: number) => void
  className?: string
  showPageCount?: boolean
}

function generatePageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (currentPage > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis')
  }

  pages.push(totalPages)
  return pages
}

function Pagination({
  meta,
  onPageChange,
  className,
  showPageCount = true,
}: PaginationProps) {
  const { page, totalPages, total, limit, hasNextPage, hasPreviousPage } = meta

  if (totalPages <= 1) return null

  const pages = generatePageNumbers(page, totalPages)
  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  return (
    <div
      className={clsx(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-4',
        className,
      )}
    >
      {showPageCount && (
        <p className="text-sm text-slate-500 shrink-0">
          Showing{' '}
          <span className="font-medium text-slate-700">{startItem}</span>
          {' '}–{' '}
          <span className="font-medium text-slate-700">{endItem}</span>
          {' '}of{' '}
          <span className="font-medium text-slate-700">{total}</span>
          {' '}results
        </p>
      )}

      <nav
        role="navigation"
        aria-label="Pagination"
        className="flex items-center gap-1"
      >
        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          className={clsx(
            'flex items-center gap-1 px-3 h-9 rounded-lg text-sm font-medium transition-colors',
            'border border-slate-200',
            hasPreviousPage
              ? 'text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              : 'text-slate-300 cursor-not-allowed',
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) =>
            p === 'ellipsis' ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex items-center justify-center w-9 h-9 text-slate-400"
                aria-hidden="true"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
                className={clsx(
                  'w-9 h-9 rounded-lg text-sm font-medium transition-colors border',
                  p === page
                    ? 'bg-rnec-teal text-white border-rnec-teal'
                    : 'text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300',
                )}
              >
                {p}
              </button>
            ),
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className={clsx(
            'flex items-center gap-1 px-3 h-9 rounded-lg text-sm font-medium transition-colors',
            'border border-slate-200',
            hasNextPage
              ? 'text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              : 'text-slate-300 cursor-not-allowed',
          )}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  )
}

export { Pagination }
