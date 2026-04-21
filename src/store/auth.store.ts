import { create } from 'zustand'
import { persist, type StorageValue } from 'zustand/middleware'
import type { User } from '@/types'

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days

const cookieStorage = {
  getItem: (name: string): StorageValue<unknown> | null => {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    if (!match) return null
    try {
      return JSON.parse(decodeURIComponent(match[1]))
    } catch {
      return null
    }
  },
  setItem: (name: string, value: StorageValue<unknown>) => {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
  },
  removeItem: (name: string) => {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=; path=/; max-age=0`
  },
}

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
      storage: cookieStorage,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
