'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { ApplicantLayout } from '@/components/layout/applicant-layout'

const roleRedirects: Record<string, string> = {
  REVIEWER: '/reviewer/dashboard',
  IRB_ADMIN: '/irb-admin/dashboard',
  RNEC_ADMIN: '/rnec-admin/dashboard',
  FINANCE_OFFICER: '/finance/dashboard',
  CHAIRPERSON: '/chairperson/dashboard',
  SYSTEM_ADMIN: '/system-admin/dashboard',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const [hydrated, setHydrated] = useState(false)

  // useEffect(() => {
  //   // Wait for Zustand persist to finish reading from storage before checking auth
  //   const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
  //   // In case hydration already completed before this effect ran
  //   if (useAuthStore.persist.hasHydrated()) setHydrated(true)
  //   return unsub
  // }, [])

  // useEffect(() => {
  //   if (!hydrated) return
  //   if (!isAuthenticated) {
  //     router.replace('/login')
  //     return
  //   }
  //   if (user?.role !== 'APPLICANT') {
  //     router.replace(roleRedirects[user?.role ?? ''] ?? '/login')
  //   }
  // }, [hydrated, isAuthenticated, user, router])

  // if (!hydrated || !isAuthenticated || user?.role !== 'APPLICANT') {
  //   return null
  // }

  return <ApplicantLayout>{children}</ApplicantLayout>
}
