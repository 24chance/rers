import { clsx } from 'clsx'

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'teal' | 'navy' | 'gold' | 'white'
  centered?: boolean
  label?: string
  className?: string
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
}

const colorMap = {
  teal: 'border-rnec-teal border-t-transparent',
  navy: 'border-rnec-navy border-t-transparent',
  gold: 'border-rnec-gold border-t-transparent',
  white: 'border-white border-t-transparent',
}

function Loader({
  size = 'md',
  color = 'teal',
  centered = true,
  label,
  className,
}: LoaderProps) {
  const spinner = (
    <div
      role="status"
      aria-label={label ?? 'Loading'}
      className={clsx('flex flex-col items-center gap-3', centered && 'justify-center', className)}
    >
      <div
        className={clsx(
          'rounded-full animate-spin',
          sizeMap[size],
          colorMap[color],
        )}
        aria-hidden="true"
      />
      {label && <p className="text-sm text-slate-500">{label}</p>}
      <span className="sr-only">{label ?? 'Loading'}</span>
    </div>
  )

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px]">
        {spinner}
      </div>
    )
  }

  return spinner
}

// Full-page centered loader
function PageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <Loader size="lg" color="teal" label={label} centered={false} />
    </div>
  )
}

export { Loader, PageLoader }
