// Types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor'
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Authentication functions - Use Supabase for real authentication
export function authenticateUser(email: string, password: string): User | null {
  // This function is deprecated. Use Supabase authentication instead.
  // See components/auth/AuthProvider.tsx for client-side auth
  return null
}

export function getUserRedirectPath(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'editor':
      return '/admin/articles'
    default:
      return '/admin/dashboard'
  }
}

// Local storage utilities
export function loadAuthState(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('admin_user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function saveAuthState(user: User): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('admin_user', JSON.stringify(user))
}

export function clearAuthState(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('admin_user')
}
