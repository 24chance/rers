import Link from 'next/link'
import {
  Shield,
  ClipboardCheck,
  Award,
  ArrowRight,
  CheckCircle,
  Globe,
  Users,
  Clock,
  FileText,
  Search,
  BookOpen,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

// ─── Hero Section ──────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center rnec-gradient overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Decorative background shapes */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-white opacity-[0.03]" />
        <div className="absolute bottom-[-15%] left-[-8%] h-[600px] w-[600px] rounded-full bg-rnec-gold opacity-[0.05]" />
        <div className="absolute top-[20%] left-[10%] h-[200px] w-[200px] rounded-full bg-rnec-light-teal opacity-[0.08]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5 text-rnec-gold" aria-hidden="true" />
            <span className="text-sm font-medium text-white/90">
              Rwanda National Ethics Committee
            </span>
          </div>

          {/* Main heading */}
          <h1 id="hero-heading" className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            <span className="block">RNEC</span>
            <span className="mt-2 block text-rnec-gold">Research Ethics</span>
            <span className="block">Review System</span>
          </h1>

          {/* Tagline */}
          <p className="mt-6 text-xl leading-8 text-white/80 max-w-2xl">
            Ethical Excellence and Integrity in Research.{' '}
            <span className="text-white font-medium">
              Streamlining the ethical review process for researchers, institutions, and reviewers across Rwanda.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-rnec-gold px-7 py-3.5 text-base font-semibold text-rnec-navy transition-all hover:bg-rnec-gold-light hover:shadow-lg hover:shadow-rnec-gold/20 focus:outline-none focus:ring-2 focus:ring-rnec-gold focus:ring-offset-2 focus:ring-offset-rnec-navy"
            >
              Submit Application
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>

            <Link
              href="/verify-certificate"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white/40 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-rnec-navy"
            >
              <Award className="h-5 w-5" aria-hidden="true" />
              Verify Certificate
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap gap-8">
            {[
              { value: '500+', label: 'Applications Reviewed' },
              { value: '120+', label: 'Institutions Registered' },
              { value: '98%', label: 'Satisfaction Rate' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-rnec-gold">{stat.value}</p>
                <p className="mt-1 text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/5 to-transparent"
        aria-hidden="true"
      />
    </section>
  )
}

// ─── Features Section ──────────────────────────────────────────────────────────

const features = [
  {
    icon: ClipboardCheck,
    title: 'Streamlined Submissions',
    description:
      'Submit research protocols, consent forms, and supporting documents through our secure digital platform. Track your application status in real-time from submission to approval.',
    color: 'text-rnec-teal',
    bg: 'bg-rnec-teal/10',
  },
  {
    icon: Shield,
    title: 'Expert Ethical Review',
    description:
      'Applications are evaluated by qualified reviewers following international ethical standards. Full Board, Expedited, and Exempt review pathways are available to match your research type.',
    color: 'text-rnec-navy',
    bg: 'bg-rnec-navy/10',
  },
  {
    icon: Award,
    title: 'Digital Certification',
    description:
      'Receive tamper-proof digital ethics certificates upon approval. Certificates are verifiable online by any stakeholder with our public verification tool.',
    color: 'text-rnec-gold',
    bg: 'bg-rnec-gold/10',
  },
]

function Features() {
  return (
    <section
      className="bg-white py-24 sm:py-32"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight text-rnec-navy sm:text-4xl"
          >
            Everything you need for ethical research
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Our digital platform brings efficiency, transparency, and accountability to the
            research ethics review process.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Additional feature grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Clock, label: 'Real-time Tracking' },
            { icon: Globe, label: 'Online Certificate Verification' },
            { icon: Users, label: 'Multi-reviewer Coordination' },
            { icon: FileText, label: 'Document Management' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3"
            >
              <item.icon className="h-5 w-5 text-rnec-teal shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ──────────────────────────────────────────────────────────────

const steps = [
  {
    number: '01',
    title: 'Register & Create Account',
    description:
      'Create your researcher account and register your institution. Verify your email to activate your profile.',
    icon: Users,
  },
  {
    number: '02',
    title: 'Prepare & Submit Application',
    description:
      'Complete the research ethics application form. Attach your protocol, consent forms, and all required documents.',
    icon: FileText,
  },
  {
    number: '03',
    title: 'Screening & Payment',
    description:
      'Your application undergoes initial screening. Receive an invoice and confirm payment to proceed to full review.',
    icon: ClipboardCheck,
  },
  {
    number: '04',
    title: 'Expert Review',
    description:
      'Qualified reviewers assess your application. You may be asked to respond to queries or provide clarifications.',
    icon: Search,
  },
  {
    number: '05',
    title: 'Decision & Certificate',
    description:
      'Receive the committee decision. If approved, download your digital ethics certificate instantly.',
    icon: Award,
  },
  {
    number: '06',
    title: 'Ongoing Monitoring',
    description:
      'Submit progress reports, amendments, and renewals. Your approved research is monitored throughout its lifecycle.',
    icon: BookOpen,
  },
]

function HowItWorks() {
  return (
    <section
      className="bg-slate-50 py-24 sm:py-32"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="how-it-works-heading"
            className="text-3xl font-bold tracking-tight text-rnec-navy sm:text-4xl"
          >
            How it works
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From submission to approval — a transparent, step-by-step review process.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line (between cards on desktop) */}
              {index < steps.length - 1 && (
                <div
                  className="absolute top-8 left-full z-10 hidden w-8 h-[2px] bg-slate-200 lg:block"
                  aria-hidden="true"
                />
              )}

              <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm h-full">
                <div className="flex items-center gap-4 mb-4">
                  {/* Step number */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl rnec-gradient">
                    <span className="text-sm font-bold text-rnec-gold">{step.number}</span>
                  </div>

                  {/* Step icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <step.icon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ────────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="rnec-gradient py-16 sm:py-20" aria-label="Call to action">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to submit your research for ethical review?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Join hundreds of researchers who use RNEC to obtain ethical approval for their
            studies. Get started today.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-rnec-gold px-7 py-3.5 text-base font-semibold text-rnec-navy transition-all hover:bg-rnec-gold-light hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-rnec-gold focus:ring-offset-2 focus:ring-offset-rnec-navy"
            >
              Create Account
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white/40 px-7 py-3.5 text-base font-semibold text-white transition-all hover:border-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Sign In
            </Link>
          </div>

          <p className="mt-6 text-sm text-white/50">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-rnec-gold hover:text-rnec-gold-light underline underline-offset-2"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-rnec-navy text-white" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rnec-gold">
                <Shield className="h-5 w-5 text-rnec-navy" aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">RNEC</p>
                <p className="text-xs text-white/60">Rwanda National Ethics Committee</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/60 max-w-sm">
              Promoting ethical excellence and integrity in research across Rwanda.
              Protecting research participants and upholding global ethical standards.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-2">
              {[
                { icon: Mail, text: 'info@rnec.rw' },
                { icon: Phone, text: '+250 780 000 000' },
                { icon: MapPin, text: 'Kigali, Rwanda' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-white/60">
                  <Icon className="h-4 w-4 text-rnec-gold shrink-0" aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-rnec-gold uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Submit Application', href: '/register' },
                { label: 'Track Application', href: '/login' },
                { label: 'Verify Certificate', href: '/verify-certificate' },
                { label: 'Public Registry', href: '/registry' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-rnec-gold" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-rnec-gold uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Guidelines', href: '#' },
                { label: 'Forms & Templates', href: '#' },
                { label: 'Training Materials', href: '#' },
                { label: 'Contact Support', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-rnec-gold" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Rwanda National Ethics Committee. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Use', 'Accessibility'].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-sm text-white/40 transition-colors hover:text-white/70"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Navigation Bar ────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-rnec-navy/95 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"
        aria-label="Global navigation"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rnec-gold">
            <Shield className="h-5 w-5 text-rnec-navy" aria-hidden="true" />
          </div>
          <div>
            <span className="text-base font-bold text-white">RNEC</span>
            <span className="hidden sm:block text-xs text-white/60">Ethics Review System</span>
          </div>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: 'Registry', href: '/registry' },
            { label: 'Verify Certificate', href: '/verify-certificate' },
            { label: 'Guidelines', href: '#' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white px-3 py-2 hidden sm:block"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-rnec-gold px-4 py-2 text-sm font-semibold text-rnec-navy transition-all hover:bg-rnec-gold-light focus:outline-none focus:ring-2 focus:ring-rnec-gold focus:ring-offset-2 focus:ring-offset-rnec-navy"
          >
            Get Started
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </header>
  )
}

// ─── Trusted By Section ────────────────────────────────────────────────────────

function TrustedBy() {
  const institutions = [
    'University of Rwanda',
    'Rwanda Biomedical Centre',
    'King Faisal Hospital',
    'CHUK',
    'CHUB',
    'Rwanda FDA',
  ]

  return (
    <section className="bg-white py-12 border-y border-slate-100" aria-label="Trusted institutions">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider mb-8">
          Trusted by leading research institutions across Rwanda
        </p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
          {institutions.map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 text-slate-400"
            >
              <CheckCircle className="h-4 w-4 text-rnec-teal" aria-hidden="true" />
              <span className="text-sm font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <CTABanner />
      </main>
      <Footer />
    </>
  )
}
