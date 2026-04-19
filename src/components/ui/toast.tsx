'use client'

import toast, { type ToastOptions } from 'react-hot-toast'
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const defaultOptions: ToastOptions = {
  duration: 4000,
}

const rnecToast = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, {
      ...defaultOptions,
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" aria-hidden="true" />,
      style: {
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      ...options,
    }),

  error: (message: string, options?: ToastOptions) =>
    toast.error(message, {
      ...defaultOptions,
      icon: <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />,
      style: {
        background: '#fef2f2',
        color: '#991b1b',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      ...options,
    }),

  info: (message: string, options?: ToastOptions) =>
    toast(message, {
      ...defaultOptions,
      icon: <Info className="h-5 w-5 text-blue-500" aria-hidden="true" />,
      style: {
        background: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      ...options,
    }),

  warning: (message: string, options?: ToastOptions) =>
    toast(message, {
      ...defaultOptions,
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />,
      style: {
        background: '#fffbeb',
        color: '#92400e',
        border: '1px solid #fde68a',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      ...options,
    }),

  loading: (message: string, options?: ToastOptions) =>
    toast.loading(message, {
      style: {
        background: '#f8fafc',
        color: '#0B2447',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
      },
      ...options,
    }),

  dismiss: toast.dismiss,
  promise: toast.promise,
}

export { rnecToast as toast }
export { toast as rawToast }
export default rnecToast
