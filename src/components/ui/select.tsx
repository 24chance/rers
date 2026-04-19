'use client'

import { forwardRef, useId } from 'react'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options?: SelectOption[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options = [],
      placeholder,
      id,
      children,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const selectId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
            {label}
            {props.required && (
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              'w-full appearance-none rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-slate-900',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-rnec-teal focus:border-transparent',
              'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
              error
                ? 'border-red-400 focus:ring-red-400'
                : 'border-slate-300 hover:border-slate-400',
              className,
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.length > 0
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {error && (
          <p id={`${selectId}-error`} role="alert" className="text-xs text-red-600 flex items-center gap-1">
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${selectId}-helper`} className="text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'

export { Select }
