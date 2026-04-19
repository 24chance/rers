'use client'

import Link from 'next/link'
import { Shield, ArrowLeft, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen rnec-gradient flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group"
          aria-label="Back to RNEC home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rnec-gold transition-transform group-hover:scale-105">
            <Shield className="h-5 w-5 text-rnec-navy" aria-hidden="true" />
          </div>
          <div>
            <span className="text-base font-bold text-white">RNEC</span>
            <span className="block text-xs text-white/60">Ethics Review System</span>
          </div>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-lg">
          {/* 404 illustration */}
          <div className="relative mb-8 inline-block" aria-hidden="true">
            {/* Decorative rings */}
            <div className="absolute inset-0 -m-8 rounded-full border border-white/10" />
            <div className="absolute inset-0 -m-16 rounded-full border border-white/5" />

            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="text-5xl font-extrabold text-rnec-gold tracking-tighter">
                404
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="mt-4 text-lg text-white/70 leading-relaxed">
            The page you are looking for doesn&apos;t exist, has been moved, or is temporarily
            unavailable.
          </p>

          {/* Suggestions */}
          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-left">
            <p className="text-sm font-semibold text-rnec-gold mb-3">You might be looking for:</p>
            <ul className="space-y-2">
              {[
                { label: 'Submit a research application', href: '/register' },
                { label: 'Sign in to your account', href: '/login' },
                { label: 'Verify an ethics certificate', href: '/verify-certificate' },
                { label: 'Browse the public registry', href: '/registry' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white group"
                  >
                    <Search
                      className="h-3.5 w-3.5 text-rnec-gold shrink-0 transition-transform group-hover:scale-110"
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-rnec-gold px-6 py-3 text-sm font-semibold text-rnec-navy transition-all hover:bg-rnec-gold-light focus:outline-none focus:ring-2 focus:ring-rnec-gold focus:ring-offset-2 focus:ring-offset-rnec-navy"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Link>

            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.history.back()
              }}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Go Back
            </button>
          </div>

          {/* Help text */}
          <p className="mt-8 text-sm text-white/40">
            If you believe this is an error, please contact{' '}
            <a
              href="mailto:support@rnec.rw"
              className="text-rnec-gold hover:text-rnec-gold-light underline underline-offset-2 transition-colors"
            >
              support@rnec.rw
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 lg:px-8">
        <p className="text-center text-sm text-white/30">
          &copy; {new Date().getFullYear()} Rwanda National Ethics Committee. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
