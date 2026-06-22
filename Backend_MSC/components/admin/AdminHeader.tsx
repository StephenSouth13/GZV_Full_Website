"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  LogOut, 
  User, 
  Settings,
  Menu,
  Sun,
  Moon
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabase'

interface AdminHeaderProps {
  onToggleSidebar: () => void
  sidebarCollapsed: boolean
}

export function AdminHeader({ onToggleSidebar, sidebarCollapsed }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('collab')

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const role = localStorage.getItem('user_role') || 'collab'
        setUserRole(role)
      }
    }
    getUser()
  }, [])

  // TODO: Load real notifications from database
  const notifications: Array<{ id: number; title: string; time: string; unread: boolean }> = []

  const unreadCount = notifications.filter(n => n.unread).length

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('user_role')
    router.push('/admin-login')
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-blue-500' : 'bg-emerald-500'
  }

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
           'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
  }

  return (
    <header className="h-14 md:h-16 backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 border-b border-white/20 dark:border-gray-700/20 relative z-30 w-full">
      <div className="flex items-center justify-between h-full px-4 md:px-6 w-full">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:block"
          >
            <h1 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {userRole} Dashboard
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              Welcome back, {user?.name}
            </p>
          </motion.div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications - hidden on mobile */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative hidden sm:flex">
                <Bell className="h-4 md:h-5 w-4 md:w-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {unreadCount}
                    </Badge>
                  </motion.div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 md:w-80 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90">
              <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-start space-x-3 w-full">
                      <div className={cn(
                        'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                        notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarImage src={user?.email} alt={user?.name} />
                  <AvatarFallback className={cn('text-white text-xs md:text-sm', getRoleColor(userRole))}>
                    {getUserInitials(user?.email || user?.user_metadata?.full_name || 'User')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 md:w-56 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  <Badge className={cn('w-fit mt-1 text-xs', getRoleBadgeColor(userRole))}>
                    {userRole}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleNavigate('/admin/profile')}>
                <User className="mr-2 h-4 w-4" />
                Hồ sơ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavigate('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
