"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/20 overflow-hidden">
      {/* Glassmorphism background overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-white/40 via-blue-50/30 to-indigo-100/40 dark:from-gray-900/40 dark:via-slate-800/30 dark:to-indigo-900/40 backdrop-blur-3xl pointer-events-none" />
      
      <div className="relative flex h-screen overflow-hidden w-full">
        {/* Sidebar - hidden on mobile, shown on lg */}
        <div className="hidden lg:block">
          <AdminSidebar
            isOpen={sidebarOpen}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar - shown on mobile when open */}
        {sidebarOpen && (
          <motion.div
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3 }}
            className="absolute lg:hidden z-40 h-screen"
          >
            <AdminSidebar
              isOpen={sidebarOpen}
              isCollapsed={false}
              onToggleCollapse={() => setSidebarOpen(false)}
            />
          </motion.div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
          {/* Header */}
          <AdminHeader
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Page Content */}
          <motion.main
            className="flex-1 overflow-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 min-h-full w-full">
              {children}
            </div>
          </motion.main>
        </div>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
