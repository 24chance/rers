import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { QueryProvider } from '@/lib/providers/query-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'RNEC - Research Ethics Review System',
  description:
    'Rwanda National Ethics Committee – Digital platform for ethical research review, certificate management, and compliance monitoring.',
  keywords: ['research ethics', 'IRB', 'RNEC', 'Rwanda', 'ethics review', 'research approval'],
  authors: [{ name: 'RNEC' }],
  openGraph: {
    title: 'RNEC - Research Ethics Review System',
    description:
      'Rwanda National Ethics Committee – Digital platform for ethical research review.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full font-[family-name:var(--font-inter)] antialiased">
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid rgba(201, 168, 64, 0.2)',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#C9A840',
                  secondary: '#1e293b',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#1e293b',
                },
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}
