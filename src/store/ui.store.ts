import { create } from 'zustand'
import type { Tenant } from '@/types'

interface UIState {
  sidebarOpen: boolean
  selectedTenant: Tenant | null
  notificationDrawerOpen: boolean
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSelectedTenant: (tenant: Tenant | null) => void
  toggleNotificationDrawer: () => void
  setNotificationDrawerOpen: (open: boolean) => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()((set) => ({
  // Initial state
  sidebarOpen: true,
  selectedTenant: null,
  notificationDrawerOpen: false,

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

  setSelectedTenant: (tenant: Tenant | null) => set({ selectedTenant: tenant }),

  toggleNotificationDrawer: () =>
    set((state) => ({ notificationDrawerOpen: !state.notificationDrawerOpen })),

  setNotificationDrawerOpen: (open: boolean) => set({ notificationDrawerOpen: open }),
}))
