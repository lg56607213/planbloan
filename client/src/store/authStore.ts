import { create } from 'zustand'

export interface AuthUser {
  userId: number
  name: string
  email: string
  role: 'CUSTOMER' | 'PARTNER_ADMIN' | 'HQ_ADMIN'
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

const STORAGE_KEY = 'planbloan-auth'

function loadInitial(): { token: string | null; user: AuthUser | null } {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return { token: null, user: null }
  try {
    return JSON.parse(raw)
  } catch {
    return { token: null, user: null }
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadInitial(),
  login: (token, user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ token: null, user: null })
  },
}))
