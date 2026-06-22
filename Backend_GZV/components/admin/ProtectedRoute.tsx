"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'collab')[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['admin', 'collab'],
  redirectTo = '/admin-login'
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('collab')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push(redirectTo)
          return
        }

        setUser(session.user)

        // Get user role from localStorage or fetch from database
        let role = localStorage.getItem('user_role') || 'collab'
        
        if (!localStorage.getItem('user_role')) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          role = profile?.role || 'collab'
          localStorage.setItem('user_role', role)
        }

        setUserRole(role)

        // Check if user role is allowed for this route
        if (!allowedRoles.includes(role as 'admin' | 'collab')) {
          // Redirect based on role
          if (role === 'admin') {
            router.push('/admin/dashboard')
          } else if (role === 'collab') {
            router.push('/admin/articles')
          } else {
            router.push(redirectTo)
          }
          return
        }

      } catch (error) {
        console.error('Auth check error:', error)
        router.push(redirectTo)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        localStorage.removeItem('user_role')
        router.push(redirectTo)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [allowedRoles, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || !allowedRoles.includes(userRole as 'admin' | 'collab')) {
    return null
  }

  return <>{children}</>
}