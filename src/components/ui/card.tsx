import { clsx } from 'clsx'

// ─── Card ────────────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  bordered?: boolean
}

function Card({
  className,
  shadow = 'sm',
  hoverable = false,
  bordered = true,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl bg-white',
        bordered && 'border border-slate-200',
        shadow === 'sm' && 'shadow-sm',
        shadow === 'md' && 'shadow-md',
        shadow === 'lg' && 'shadow-lg',
        hoverable &&
          'transition-shadow duration-200 hover:shadow-md cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── CardHeader ──────────────────────────────────────────────────────────────

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  divider?: boolean
}

function CardHeader({ className, divider = true, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={clsx(
        'px-6 py-4',
        divider && 'border-b border-slate-100',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── CardBody ────────────────────────────────────────────────────────────────

function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
}

// ─── CardFooter ──────────────────────────────────────────────────────────────

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  divider?: boolean
}

function CardFooter({ className, divider = true, children, ...props }: CardFooterProps) {
  return (
    <div
      className={clsx(
        'px-6 py-4',
        divider && 'border-t border-slate-100',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card, CardHeader, CardBody, CardFooter }
