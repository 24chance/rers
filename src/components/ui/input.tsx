'use client'

import { forwardRef, useId } from 'react'
import { clsx } from 'clsx'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftElement, rightElement, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftElement && (
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900',
              'placeholder:text-slate-400',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-rnec-teal focus:border-transparent',
              'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
              error
                ? 'border-red-400 focus:ring-red-400'
                : 'border-slate-300 hover:border-slate-400',
              leftElement && 'pl-10',
              rightElement && 'pr-10',
              className,
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 flex items-center text-slate-400">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600 flex items-center gap-1">
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
