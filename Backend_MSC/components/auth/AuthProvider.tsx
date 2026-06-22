"use client"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase" // Dùng trực tiếp cái này

export type AuthContextValue = {
  user: any
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Lấy session thực tế từ Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = useMemo(() => ({
    user,
    signOut: async () => {
      await supabase.auth.signOut()
      setUser(null)
    }
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}