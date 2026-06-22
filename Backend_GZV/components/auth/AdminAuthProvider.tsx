"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Local types and functions
interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor'
}

function loadAuthState(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('admin_user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveAuthState(user: User): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('admin_user', JSON.stringify(user))
}

function clearAuthState(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('admin_user')
}

interface AdminAuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  loading: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load auth state from localStorage on mount
    const savedUser = loadAuthState()
    setUser(savedUser)
    setLoading(false)
  }, [])

  const login = (user: User) => {
    setUser(user)
    saveAuthState(user)
  }

  const logout = () => {
    setUser(null)
    clearAuthState()
  }

  const value: AdminAuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}