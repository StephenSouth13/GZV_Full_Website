"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { User, BookOpen, ShoppingCart, Receipt, Settings, LogOut } from "lucide-react"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  const nav = [
    { href: "/student/dashboard", label: "Tổng quan", icon: User },
    { href: "/student/my-courses", label: "Khóa học của tôi", icon: BookOpen },
    { href: "/cart", label: "Giỏ hàng", icon: ShoppingCart },
    { href: "/student/orders", label: "Đơn hàng", icon: Receipt },
    { href: "/student/settings", label: "Cài đặt", icon: Settings },
  ]

  const handleLogout = () => {
    logout()
    router.replace("/")
  }

  return (
    <div className="min-h-[80vh] grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 container py-8">
      <aside className="md:sticky md:top-24 h-max rounded-xl border bg-white dark:bg-gray-800 p-4 shadow-sm">
        {/* User Info Section */}
        <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name || "User"} 
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Xin chào,</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {user.fullName || user.name || "Học viên"}
              </div>
              {user.email && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                  {user.email}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {nav.map((n) => {
            const active = pathname.startsWith(n.href)
            const Icon = n.icon
            return (
              <Link key={n.href} href={n.href} className="block">
                <Button 
                  variant={active ? "default" : "ghost"} 
                  className="w-full justify-start text-sm"
                >
                  <Icon className="w-4 h-4 mr-3" /> {n.label}
                </Button>
              </Link>
            )
          })}
          
          {/* Logout Button */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" /> Đăng xuất
            </Button>
          </div>
        </nav>
      </aside>
      
      <section className="min-h-[600px]">{children}</section>
    </div>
  )
}
