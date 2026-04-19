import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { clsx } from 'clsx'

export interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  firstName?: string
  lastName?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: { wrapper: 'h-8 w-8', text: 'text-xs', indicator: 'h-2 w-2' },
  md: { wrapper: 'h-10 w-10', text: 'text-sm', indicator: 'h-2.5 w-2.5' },
  lg: { wrapper: 'h-12 w-12', text: 'text-base', indicator: 'h-3 w-3' },
  xl: { wrapper: 'h-16 w-16', text: 'text-xl', indicator: 'h-3.5 w-3.5' },
}

function getInitials(firstName?: string, lastName?: string, fallback?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase()
  }
  if (fallback) {
    return fallback.slice(0, 2).toUpperCase()
  }
  return '?'
}

function Avatar({ src, alt, fallback, firstName, lastName, size = 'md', className }: AvatarProps) {
  const sizes = sizeMap[size]
  const initials = getInitials(firstName, lastName, fallback)

  return (
    <AvatarPrimitive.Root
      className={clsx(
        'relative inline-flex shrink-0 overflow-hidden rounded-full',
        sizes.wrapper,
        className,
      )}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={alt ?? initials}
          className="h-full w-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        className={clsx(
          'flex h-full w-full items-center justify-center',
          'bg-gradient-to-br from-rnec-navy to-rnec-teal',
          'text-white font-semibold',
          sizes.text,
        )}
        delayMs={src ? 600 : 0}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

export { Avatar }
