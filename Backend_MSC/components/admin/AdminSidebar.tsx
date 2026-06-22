"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  BookOpen, 
  FolderOpen, 
  Share2, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Image,
  UserCircle2, 
  PenTool,
  Mail, // Icon cho tin nhắn liên hệ
  GraduationCap, // Icon chuyên dụng cho Mentors
  Handshake // Icon cho Đối tác

} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface AdminSidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const adminMenuItems = [
  {
    title: 'Bảng điều khiển',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'collab']
  },
  {
    title: 'Chương trình Đào tạo',
    href: '/admin/training',
    icon: BookOpen,
    roles: ['admin', 'collab']
  },
  {
    title: 'Quản lý MSCers',
    href: '/admin/mscers',
    icon: UserCircle2,
    roles: ['admin', 'collab']
  },
  {
    title: 'Quản lý Mentors',
    href: '/admin/mentors',
    icon: GraduationCap,
    roles: ['admin', 'collab']
  },
  {
    title: 'Đối tác & Đồng hành',
    href: '/admin/partners',
    icon: Handshake,
    roles: ['admin', 'collab']
  },
  {
    title: 'Danh mục tác giả',
    href: '/admin/authors',
    icon: PenTool,
    roles: ['admin', 'collab']
  },
  {
    title: 'Tin nhắn liên hệ',
    href: '/admin/contacts',
    icon: Mail,
    roles: ['admin', 'collab']
  },
  {
    title: 'Dự án',
    href: '/admin/projects',
    icon: FolderOpen,
    roles: ['admin', 'collab']
  },
  {
    title: 'Bài viết',
    href: '/admin/articles',
    icon: Share2,
    roles: ['admin', 'collab']
  },
  {
    title: 'Quản lý hình ảnh',
    href: '/admin/images',
    icon: Image,
    roles: ['admin', 'collab']
  },
  {
    title: 'Quản lý người dùng',
    href: '/admin/users',
    icon: Users,
    roles: ['admin']
  },
  {
    title: 'Tài chính',
    href: '/admin/finance',
    icon: DollarSign,
    roles: ['admin']
  }
]

const userMenuItems = [
  {
    title: 'Hồ sơ',
    href: '/admin/profile',
    icon: UserCircle2,
    roles: ['admin', 'collab']
  },
  {
    title: 'Cài đặt',
    href: '/admin/settings',
    icon: Settings,
    roles: ['admin', 'collab']
  }
]

export function AdminSidebar({ isOpen, isCollapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string>('collab')

  useEffect(() => {
    const role = localStorage.getItem('user_role') || 'collab'
    setUserRole(role)
  }, [])

  const filteredMenuItems = adminMenuItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'h-full backdrop-blur-xl bg-gray-900/95 border-r border-white/10',
        'flex flex-col shadow-2xl flex-shrink-0 relative z-30'
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-white font-bold tracking-tight text-sm uppercase">MSC Center</span>
          </motion.div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-white hover:bg-white/10 p-1 h-8 w-8 rounded-full"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-400 hover:text-gray-100',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <Icon className={cn(
                  'flex-shrink-0 transition-colors h-5 w-5',
                  isActive ? 'text-white' : 'group-hover:text-white'
                )} />

                {!isCollapsed && (
                  <span className="font-semibold text-[13px]">
                    {item.title}
                  </span>
                )}
              </motion.div>
            </Link>
          )
        })}

        {/* User Menu Section */}
        {!isCollapsed && (
          <>
            <div className="my-4 border-t border-white/10" />
            {userMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-gray-400 hover:text-gray-100',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    <Icon className={cn(
                      'flex-shrink-0 transition-colors h-5 w-5',
                      isActive ? 'text-white' : 'group-hover:text-white'
                    )} />

                    <span className="font-semibold text-[13px]">
                      {item.title}
                    </span>
                  </motion.div>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-white/10 bg-black/10">
        {!isCollapsed && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Hệ thống sẵn sàng</span>
            </div>
            <p className="text-[9px] text-gray-600 font-medium ml-4 italic">v2.5.0 MSC Quản trị</p>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
