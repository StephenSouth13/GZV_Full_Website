"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderOpen, 
  Share2, 
  ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditorSidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const editorMenuItems = [
  {
    title: 'Dashboard',
    href: '/editor/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Courses',
    href: '/editor/courses',
    icon: BookOpen
  },
  {
    title: 'Projects',
    href: '/editor/projects',
    icon: FolderOpen
  },
  {
    title: 'Shares/Articles',
    href: '/editor/articles',
    icon: Share2
  },
  {
    title: 'Media Library',
    href: '/editor/media',
    icon: ImageIcon
  }
]

export function EditorSidebar({ isOpen, isCollapsed, onToggleCollapse }: EditorSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 64 : 256,
          x: isOpen ? 0 : -256
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 z-50 h-full backdrop-blur-xl bg-emerald-900/90 border-r border-white/10',
          'flex flex-col shadow-2xl'
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-white font-semibold">Editor Panel</span>
            </motion.div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-white hover:bg-white/10 p-1 h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {editorMenuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'hover:bg-white/10 hover:backdrop-blur-sm',
                    isActive && 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className={cn(
                    'flex-shrink-0 transition-colors',
                    isActive ? 'text-emerald-400' : 'text-gray-300',
                    'h-5 w-5'
                  )} />
                  
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        'font-medium transition-colors',
                        isActive ? 'text-white' : 'text-gray-300'
                      )}
                    >
                      {item.title}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-xs text-gray-400">MSC Editor Panel</p>
              <p className="text-xs text-gray-500">v1.0.0</p>
            </motion.div>
          )}
        </div>
      </motion.aside>

      {/* Spacer for main content */}
      <div
        className={cn(
          'transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      />
    </>
  )
}