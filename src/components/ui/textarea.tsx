'use client'

import { forwardRef, useId } from 'react'
import { clsx } from 'clsx'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  showCharCount?: boolean
  maxLength?: number
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      showCharCount = false,
      maxLength,
      value,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const textareaId = id ?? generatedId
    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
            {label}
            {props.required && (
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          className={clsx(
            'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900',
            'placeholder:text-slate-400 resize-vertical min-h-[100px]',
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
            error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...props}
        />

        <div className="flex items-start justify-between">
          <div>
            {error && (
              <p id={`${textareaId}-error`} role="alert" className="text-xs text-red-600 flex items-center gap-1">
                <span aria-hidden="true">⚠</span>
                {error}
              </p>
            )}
            {!error && helperText && (
              <p id={`${textareaId}-helper`} className="text-xs text-slate-500">
                {helperText}
              </p>
            )}
          </div>

          {showCharCount && maxLength && (
            <span
              className={clsx(
                'text-xs ml-auto shrink-0',
                currentLength >= maxLength ? 'text-red-500' : 'text-slate-400',
              )}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'

export { Textarea }
