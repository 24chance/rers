import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { FinanceLayout } from '@/components/layout/finance-layout'
import type { UserRole } from '@/types'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const authRaw = cookieStore.get('rnec-auth')?.value

  if (!authRaw) {
    redirect('/login')
  }

  try {
    const parsed = JSON.parse(authRaw) as {
      state?: { isAuthenticated?: boolean; user?: { role?: UserRole } }
    }
    const state = parsed?.state
    if (!state?.isAuthenticated) redirect('/login')
    if (state?.user?.role !== 'FINANCE_OFFICER') redirect('/login')
  } catch {
    redirect('/login')
  }

  return <FinanceLayout>{children}</FinanceLayout>
}
