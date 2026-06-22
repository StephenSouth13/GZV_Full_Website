"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { EditorSidebar } from './EditorSidebar'
import { AdminHeader } from './AdminHeader'

interface EditorLayoutProps {
  children: React.ReactNode
}

export function EditorLayout({ children }: EditorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/50 dark:from-slate-900 dark:via-emerald-900/20 dark:to-teal-900/20">
      {/* Glassmorphism background overlay with editor theme */}
      <div className="fixed inset-0 bg-gradient-to-br from-white/40 via-emerald-50/30 to-teal-100/40 dark:from-gray-900/40 dark:via-emerald-800/20 dark:to-teal-900/30 backdrop-blur-3xl pointer-events-none" />
      
      <div className="relative flex h-screen overflow-hidden">
        {/* Sidebar */}
        <EditorSidebar 
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}>
          {/* Header */}
          <AdminHeader 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Page Content */}
          <motion.main 
            className="flex-1 overflow-auto relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 min-h-full border-l border-white/20 dark:border-gray-700/20">
              {children}
            </div>
          </motion.main>
        </div>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && !sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  )
}