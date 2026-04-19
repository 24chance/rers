import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
}

interface AuthActions {
  setAuth: (user: User, accessToken: string) => void
  clearAuth: () => void
  updateUser: (partial: Partial<User>) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,

      // Actions
      setAuth: (user: User, accessToken: string) => {
        set({ user, accessToken, isAuthenticated: true })
      },

      clearAuth: () => {
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      updateUser: (partial: Partial<User>) => {
        const current = get().user
        if (current) {
          set({ user: { ...current, ...partial } })
        }
      },
    }),
    {
      name: 'rnec-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
