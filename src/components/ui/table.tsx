import { clsx } from 'clsx'
import { forwardRef } from 'react'

// ─── Table ────────────────────────────────────────────────────────────────────

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  stickyHeader?: boolean
  compact?: boolean
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, stickyHeader, compact, children, ...props }, ref) => (
    <div className="w-full overflow-auto rounded-lg border border-slate-200">
      <table
        ref={ref}
        className={clsx(
          'w-full caption-bottom text-sm border-collapse',
          compact ? 'text-xs' : 'text-sm',
          className,
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  ),
)
Table.displayName = 'Table'

// ─── TableHead ────────────────────────────────────────────────────────────────

const TableHead = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <thead
      ref={ref}
      className={clsx('bg-slate-50 border-b border-slate-200', className)}
      {...props}
    >
      {children}
    </thead>
  ),
)
TableHead.displayName = 'TableHead'

// ─── TableBody ────────────────────────────────────────────────────────────────

const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <tbody
      ref={ref}
      className={clsx('divide-y divide-slate-100 bg-white', className)}
      {...props}
    >
      {children}
    </tbody>
  ),
)
TableBody.displayName = 'TableBody'

// ─── TableRow ────────────────────────────────────────────────────────────────

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean
  selected?: boolean
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, hoverable = true, selected, children, ...props }, ref) => (
    <tr
      ref={ref}
      className={clsx(
        'transition-colors',
        hoverable && 'hover:bg-slate-50',
        selected && 'bg-blue-50',
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  ),
)
TableRow.displayName = 'TableRow'

// ─── TableCell ────────────────────────────────────────────────────────────────

const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, children, ...props }, ref) => (
    <td
      ref={ref}
      className={clsx('px-4 py-3 text-slate-700 align-middle', className)}
      {...props}
    >
      {children}
    </td>
  ),
)
TableCell.displayName = 'TableCell'

// ─── TableHeader (th) ─────────────────────────────────────────────────────────

export interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean
  sorted?: 'asc' | 'desc' | null
}

const TableHeader = forwardRef<HTMLTableCellElement, TableHeaderProps>(
  ({ className, sortable, sorted, children, ...props }, ref) => (
    <th
      ref={ref}
      className={clsx(
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
        sortable && 'cursor-pointer select-none hover:text-slate-700 transition-colors',
        className,
      )}
      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
      {...props}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortable && (
          <span className="text-slate-400" aria-hidden="true">
            {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : '↕'}
          </span>
        )}
      </span>
    </th>
  ),
)
TableHeader.displayName = 'TableHeader'

export { Table, TableHead, TableBody, TableRow, TableCell, TableHeader }
