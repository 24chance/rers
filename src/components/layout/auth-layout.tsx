import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — gradient branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-between rnec-gradient p-12">
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl font-bold text-rnec-gold tracking-wider">RNEC</span>
          </div>
          <p className="text-white/70 text-sm">Research Ethics Review System</p>
        </div>

        {/* Tagline */}
        <div className="space-y-4">
          <blockquote className="text-white text-2xl font-light leading-relaxed">
            "Advancing ethical research through rigorous, transparent, and efficient review processes."
          </blockquote>
          <div className="flex gap-2 mt-6">
            <div className="h-1 w-12 rounded-full bg-rnec-gold" />
            <div className="h-1 w-4 rounded-full bg-white/30" />
            <div className="h-1 w-4 rounded-full bg-white/30" />
          </div>
        </div>

        {/* Features list */}
        <div className="space-y-3">
          {[
            'Streamlined application submission',
            'Multi-level review and oversight',
            'Secure document management',
            'Real-time status tracking',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-white/80 text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-rnec-gold shrink-0" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-3xl font-bold text-rnec-navy tracking-wider">RNEC</span>
            <p className="text-slate-500 text-sm mt-1">Research Ethics Review System</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            {children}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-6">
            &copy; {new Date().getFullYear()} Rwanda National Ethics Committee. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
