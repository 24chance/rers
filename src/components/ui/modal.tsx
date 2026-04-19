'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-5xl',
}

function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Content */}
        <Dialog.Content
          className={clsx(
            'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2',
            'rounded-xl bg-white shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'focus:outline-none mx-4',
            sizeClasses[size],
            className,
          )}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                {title && (
                  <Dialog.Title className="text-lg font-semibold text-slate-900">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="mt-1 text-sm text-slate-500">
                    {description}
                  </Dialog.Description>
                )}
              </div>

              {showCloseButton && (
                <Dialog.Close
                  className={clsx(
                    'rounded-lg p-1.5 text-slate-400 transition-colors',
                    'hover:bg-slate-100 hover:text-slate-600',
                    'focus:outline-none focus:ring-2 focus:ring-rnec-teal',
                    'shrink-0',
                  )}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Dialog.Close>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Also export Dialog primitives for advanced usage
export { Modal, Dialog }
