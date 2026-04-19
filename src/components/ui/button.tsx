'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    'select-none whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-rnec-gold text-rnec-navy hover:bg-rnec-gold-light',
          'focus-visible:ring-rnec-gold shadow-sm',
          'active:scale-[0.98]',
        ],
        secondary: [
          'border-2 border-rnec-teal text-rnec-teal bg-transparent',
          'hover:bg-rnec-teal hover:text-white',
          'focus-visible:ring-rnec-teal',
          'active:scale-[0.98]',
        ],
        ghost: [
          'bg-transparent text-slate-700 hover:bg-slate-100',
          'focus-visible:ring-slate-400',
          'active:scale-[0.98]',
        ],
        danger: [
          'bg-red-600 text-white hover:bg-red-700',
          'focus-visible:ring-red-500 shadow-sm',
          'active:scale-[0.98]',
        ],
        outline: [
          'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50',
          'focus-visible:ring-slate-400',
          'active:scale-[0.98]',
        ],
        navy: [
          'bg-rnec-navy text-white hover:bg-rnec-teal',
          'focus-visible:ring-rnec-navy shadow-sm',
          'active:scale-[0.98]',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  },
)

Button.displayName = 'Button'

export { Button, buttonVariants }
