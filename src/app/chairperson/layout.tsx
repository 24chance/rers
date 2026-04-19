import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ChairpersonLayout } from '@/components/layout/chairperson-layout'
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
    if (state?.user?.role !== 'CHAIRPERSON') redirect('/login')
  } catch {
    redirect('/login')
  }

  return <ChairpersonLayout>{children}</ChairpersonLayout>
}
