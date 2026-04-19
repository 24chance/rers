import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ApplicantLayout } from '@/components/layout/applicant-layout'
import type { UserRole } from '@/types'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const authRaw = cookieStore.get('rnec-auth')?.value

  if (!authRaw) {
    // Also check localStorage-based auth via a simple redirect — client will handle it
    redirect('/login')
  }

  try {
    const parsed = JSON.parse(authRaw) as {
      state?: { isAuthenticated?: boolean; user?: { role?: UserRole } }
    }
    const state = parsed?.state
    if (!state?.isAuthenticated) {
      redirect('/login')
    }
    if (state?.user?.role !== 'APPLICANT') {
      // Redirect to the appropriate role dashboard
      const role = state?.user?.role
      if (role === 'REVIEWER') redirect('/reviewer/dashboard')
      if (role === 'IRB_ADMIN') redirect('/irb-admin/dashboard')
      if (role === 'RNEC_ADMIN') redirect('/rnec-admin/dashboard')
      if (role === 'FINANCE_OFFICER') redirect('/finance/dashboard')
      if (role === 'CHAIRPERSON') redirect('/chairperson/dashboard')
      if (role === 'SYSTEM_ADMIN') redirect('/system-admin/dashboard')
      redirect('/login')
    }
  } catch {
    redirect('/login')
  }

  return <ApplicantLayout>{children}</ApplicantLayout>
}
