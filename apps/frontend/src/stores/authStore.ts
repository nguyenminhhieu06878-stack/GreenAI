import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'tenant' | 'landlord' | 'admin'
  subscriptionExpiry?: string
  billingDate?: number
  monthlyGoal?: number
  electricityRate?: number
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        // Clear any stale data before login
        localStorage.removeItem('room-storage')
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        // Clear all persisted stores on logout
        localStorage.removeItem('room-storage')
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
      refreshUser: async () => {
        try {
          const token = get().token
          if (!token) return
          
          const response = await fetch('http://localhost:3000/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const userData = await response.json()
            set({ user: userData })
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error)
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
)
